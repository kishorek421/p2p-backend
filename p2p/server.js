require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/UserRoutes');
const authRoutes = require('./routes/AuthRoutes');
const UserModel = require('./models/UserModel');
const CallHistoryModel = require('./models/CallHistoryModel');
const CallSdpIceModel = require('./models/CallSdpIceModel');
const { ObjectId } = require('mongodb');
const RefreshToken = require('./models/RefreshToken');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors())

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/p2p';

mongoose.connect(uri, {}).then((client) => {
    console.log("Connected to MongoDB");
}).catch(err => console.error("MongoDB connection error:", err));

let clients = {};

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
    res.send('WebRTC Signaling Server');
});

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );
};

async function generateRefreshToken(userId) {
    const token = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Set expiry date to 7 days

    // Save refresh token to the database
    const refreshToken = new RefreshToken({ userId, token, expiresAt });
    await refreshToken.save();
    return token;
}

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Listen for incoming messages
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log("initial data", data);
            switch (data.type) {
                case 'sendMobileNumber':
                    await handleSendMobileNumber(data, ws);
                    break;
                case 'registerToVerifyMobileNumber':
                    await handleRegisterToVerifyMobileNumber(data, ws);
                    break;
                case 'change_user_status':
                    await handleChangeUserStatus(data, ws);
                    break;
                case 'call_user':
                    await handleCallUser(data, ws);
                    break;
                case 'accept_call':
                    await handleAcceptCall(data, ws);
                    break;
                case 'offer':
                    await handleOffer(data, ws);
                    break;
                case 'answer':
                    await handleAnswer(data, ws);
                    break;
                case 'ice':
                    await handleICE(data, ws);
                    break;
                default:
                    console.log('Unknown message type:', data.type);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        // Remove the client from the clients dictionary on disconnect
        for (const userId in clients) {
            if (clients[userId] === ws) {
                console.log(`User ${userId} disconnected`);
                delete clients[userId];
                break;
            }
        }
    });
});

async function handleSendMobileNumber(data, ws) {
    const { userId, mobileNo, } = data;

    console.log("sendMobileNumber: mobileNo ", mobileNo);

    if (userId === undefined) {
        console.log("UserId is undefined");
        return;
    }

    const result = await UserModel.create({
        verifiedToken: userId,
        username: "Hello Famy!", mobileNo: mobileNo,
        isMobileVerified: true, status: 'online',
    });

    // console.log("clients", clients);

    const token = generateToken(result._id);

    // Generate and save a new refresh token
    const refreshToken = await generateRefreshToken(result._id);

    clients[userId].send(JSON.stringify({
        type: 'receivedMobileNumber',
        success: true,
        details: result,
        token: token,
        refreshToken: refreshToken,
    }));

    if (result.modifiedCount > 0) {
        console.log(`User ${userId} created`);
    } else {
        console.log(`Failed to update status for user ${userId}`);
    }
}

async function handleRegisterToVerifyMobileNumber(data, ws) {
    const { userId } = data;

    clients[userId] = ws;

    console.log(`User ${userId} registered to verify mobile number`);
}

async function handleChangeUserStatus(data, ws) {
    const { userId, status } = data;
    if (status === 'online') {
        clients[userId] = ws
    }
    console.log("data ", data);

    if (userId === undefined) {
        console.log("UserId is undefined");
        return;
    }

    const result = await UserModel.updateOne({ _id: ObjectId.createFromHexString(userId) }, { $set: { status } });

    if (result.modifiedCount > 0) {
        console.log(`User ${userId} status updated to ${status}`);
    } else {
        console.log(`Failed to update status for user ${userId}`);
    }
}

async function handleCallUser(data, ws) {
    const { callerId, calleeId } = data;

    const callId = new ObjectId();

    if (clients[calleeId]) {
        await CallHistoryModel.create({
            _id: callId,
            callerId: ObjectId.createFromHexString(callerId),
            calleeId: ObjectId.createFromHexString(calleeId),
            status: 'ringing',
        });

        let callerDetails = UserModel.findOne({ _id: ObjectId.createFromHexString(callerId) })

        clients[calleeId].send(JSON.stringify({
            type: 'incoming_call',
            success: true,
            details: {
                callerId,
                callerMobile: callerDetails.mobileNo,
                calleeId,
                callId: callId.toString(),
            }
        }));

        console.log(`Call initiated from ${callerId} to ${calleeId}`);
    } else {
        console.log(`Callee ${calleeId} not found or offline`);
        ws.send(JSON.stringify({ type: 'call_failed', reason: 'Callee not found or offline' }));
    }
}

async function handleAcceptCall(data, ws) {
    const { callerId, calleeId, callId } = data;

    await CallHistoryModel.findOneAndUpdate({ _id: ObjectId.createFromHexString(callId) }, { $set: { status: 'accepted' } });

    if (clients[callerId]) {
        clients[callerId].send(JSON.stringify({
            type: 'call_accepted',
            callerId,
            calleeId,
            callId,
        }));
        console.log(`Call accepted by ${calleeId} from ${callerId}`);
    }
}

async function handleOffer(data, ws) {
    const { callId, callerId, calleeId, sdp } = data;

    if (clients[calleeId]) {
        await CallSdpIceModel.create({
            callId: ObjectId.createFromHexString(callId),
            callerId: ObjectId.createFromHexString(callerId),
            calleeId: ObjectId.createFromHexString(calleeId),
            sdp,
            type: 'offer',
        });

        clients[calleeId].send(JSON.stringify({
            type: 'offer',
            callId,
            callerId,
            calleeId,
            sdp,
        }));

        console.log(`Offer sent from ${callerId} to ${calleeId}`);
    } else {
        console.log(`Callee ${calleeId} not found or offline`);
    }
}

async function handleAnswer(data, ws) {
    const { callId, callerId, calleeId, sdp } = data;

    if (clients[callerId]) {
        await CallSdpIceModel.create({
            callId: ObjectId.createFromHexString(callId),
            callerId: ObjectId.createFromHexString(callerId),
            calleeId: ObjectId.createFromHexString(calleeId),
            sdp,
            type: 'answer',
        });

        clients[callerId].send(JSON.stringify({
            type: 'answer',
            callId,
            callerId,
            calleeId,
            sdp,
        }));
        console.log(`Answer sent from ${calleeId} to ${callerId}`);
    } else {
        console.log(`Caller ${callerId} not found or offline`);
    }
}

async function handleICE(data, ws) {
    const { callId, callerId, calleeId, ice } = data;

    if (clients[calleeId]) {
        await CallSdpIceModel.create({
            callId: ObjectId.createFromHexString(callId),
            callerId: ObjectId.createFromHexString(callerId),
            calleeId: ObjectId.createFromHexString(calleeId),
            ice,
            type: 'ice',
        });

        clients[calleeId].send(JSON.stringify({
            type: 'ice',
            callerId,
            calleeId,
            ice,
        }));

        console.log(`Ice sent from ${callerId} to ${calleeId}`);
    } else {
        console.log(`Callee ${calleeId} not found or offline`);
    }
}

// console.log(generateToken("6736caf3987f91ea19b614b1"));

server.listen(5000, () => {
    console.log('Signaling Server is listening on port 5000');
});