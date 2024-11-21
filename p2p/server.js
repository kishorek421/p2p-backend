require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/UserRoutes');

const app = express();
app.use(express.json());
app.use(cors())

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/p2p';
mongoose.connect(uri, {
}).then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

let clients = {};

app.use('/api/user', userRoutes);
app.get('/', (req, res) => {
    res.send('WebRTC Signaling Server');
});

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Listen for incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'SET_USER_ID') {
                const userId = data.userId;

                // Set the WebSocket connection in the clients dictionary
                clients[userId] = ws;
                console.log(`User ${userId} connected`);

                // Optional: Confirm the user ID is set
                ws.send(JSON.stringify({ type: 'USER_ID_SET', userId }));
            }

            // Additional message handling can go here

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

async function handleOffer(data, ws) {
    const { callId, callerId, calleeId, sdp, ice } = data;
    if (clients[calleeId]) {
        await callsSdpIceCollection.insertOne({
            callId: ObjectId.createFromHexString(callId),
            userId: ObjectId.createFromHexString(callerId),
            sdp,
            ice,
            type: 'offer',
            timestamp: new Date(),
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
        await callsSdpIceCollection.insertOne({
            callId: ObjectId.createFromHexString(callId),
            userId: ObjectId.createFromHexString(calleeId),
            sdp,
            ice,
            type: 'answer',
            timestamp: new Date(),
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
