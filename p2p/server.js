require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/UserRoutes');
const UserModel = require('./models/UserModel');
const CallHistoryModel = require('./models/CallHistoryModel');
const CallSdpIceModel = require('./models/CallSdpIceModel');

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

app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
    res.send('WebRTC Signaling Server');
});

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Listen for incoming messages
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            switch (data.type) {
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
        await CallHistoryModel.insertOne({
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
                callerMobile: callerDetails.mobile,
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
    const { callId, callerId, calleeId, sdp, ice } = data;

    if (clients[calleeId]) {
        await CallSdpIceModel.insertOne({
            callId: ObjectId.createFromHexString(callId),
            callerId: ObjectId.createFromHexString(callerId),
            calleeId: ObjectId.createFromHexString(calleeId),
            sdp,
            ice,
            type: 'offer',
        });

        clients[calleeId].send(JSON.stringify({
            type: 'offer',
            callerId,
            calleeId,
            sdp,
            ice,
        }));

        console.log(`Offer sent from ${callerId} to ${calleeId}`);
    } else {
        console.log(`Callee ${calleeId} not found or offline`);
    }
}

async function handleAnswer(data, ws) {
    const { callId, callerId, calleeId, sdp, ice } = data;

    if (clients[callerId]) {
        await CallSdpIceModel.insertOne({
            callId: ObjectId.createFromHexString(callId),
            callerId: ObjectId.createFromHexString(callerId),
            calleeId: ObjectId.createFromHexString(calleeId),
            sdp,
            ice,
            type: 'answer',
        });

        clients[callerId].send(JSON.stringify({
            type: 'answer',
            callerId,
            calleeId,
            sdp,
            ice,
        }));
        console.log(`Answer sent from ${calleeId} to ${callerId}`);
    } else {
        console.log(`Caller ${callerId} not found or offline`);
    }
}

server.listen(5000, () => {
    console.log('Signaling Server is listening on port 5000');
});