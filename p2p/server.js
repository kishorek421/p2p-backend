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
});

server.listen(5000, () => {
    console.log('Signaling Server is listening on port 5000');
});


