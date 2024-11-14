require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const client = new MongoClient(uri);

let usersCollection;
let usersContactsCollection;
let callHistoryCollection;
let callsSdpIceCollection;
let clients = {};

client.connect().then(() => {
    console.log('Connected to MongoDB');
    const db = client.db('webrtc');
    usersCollection = db.collection('users');
    usersContactsCollection = db.collection('users_contacts');
    callHistoryCollection = db.collection('call_history');
    callsSdpIceCollection = db.collection('calls_sdp_ice');
}).catch(err => console.error('MongoDB connection error:', err));

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

server.listen(5000, () => {
    console.log('Signaling Server is listening on port 5000');
});
