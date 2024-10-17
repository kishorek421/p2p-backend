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

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'register':
        await handleRegister(data, ws);
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
      case 'add_user_contact':
        await handleAddUserContact(data, ws);
        break;
      case 'reconnect':
        await handleReconnect(data, ws);
        break;
    }
  });

  ws.on('close', async () => {
    console.log('Client disconnected');
    for (let userId in clients) {
      if (clients[userId] === ws) {
        delete clients[userId];
        await usersCollection.updateOne({ _id: ObjectId.createFromHexString(userId) }, { $set: { status: 'offline', lastLogged: new Date() } });
        console.log(`User with ID: ${userId} set to offline`);
        break;
      }
    }
  });
});

async function handleRegister(data, ws) {
  const existingUser = await usersCollection.findOne({ mobile: data.mobile });
  if (!existingUser) {
    const result = await usersCollection.insertOne({
      mobile: data.mobile,
      status: 'online',
      registeredAt: new Date(),
    });
    const userId = result.insertedId;
    ws.send(JSON.stringify({ type: 'registered', success: true, userId }));
    console.log(`User registered with mobile: ${data.mobile}`);
  } else {
    const userId = existingUser._id;
    await usersCollection.updateOne({ mobile: data.mobile }, { $set: { status: 'online' } });
    ws.send(JSON.stringify({ type: 'registered', success: true, userId }));
    console.log(`User authenticated and set to online: ${data.mobile}, ID: ${userId}`);
  }
}

async function handleChangeUserStatus(data, ws) {
  const { userId, status } = data;

  if (status === 'online') {
    clients[userId] = ws;
  }

  console.log("data ", data);


  if (userId === undefined) {
    console.log("UserId is undefined");
    return;
  }

  const result = await usersCollection.updateOne({ _id: ObjectId.createFromHexString(userId) }, { $set: { status } });

  if (result.modifiedCount > 0) {
    console.log(`User ${userId} status updated to ${status}`);
  } else {
    console.log(`Failed to update status for user ${userId}`);
  }
}

async function handleAddUserContact(data, ws) {
  try {
    // Find the target user by mobile number
    const targetUser = await usersCollection.findOne({ mobile: data.targetUserMobile });

    if (targetUser) {
      // Insert the target user details into the collection
      const response = await usersContactsCollection.insertOne({
        currentUserId: ObjectId.createFromHexString(data.currentUserId),
        targetUserId: targetUser._id, // Use the found targetUserId
        targetUserName: data.targetUserName,
        targetUserMobile: data.targetUserMobile,
        timestamp: new Date(),
      });

      const savedDetails = await usersContactsCollection.findOne({ _id: response.insertedId })

      console.log("Added Target Details", savedDetails);

      // const savedDetails = result.ops[0]; // The saved document

      // Send success response with the saved details
      ws.send(JSON.stringify({
        type: 'user_contact_added',
        success: true,
        details: savedDetails,
      }));

      console.log(`Target user details added for currentUserId: ${data.currentUserId}`);
    } else {
      // If the target user is not found, send a failure response
      ws.send(JSON.stringify({
        type: 'user_contact_added',
        success: false,
        message: 'Target user not found',
      }));

      console.log(`Target user not found for mobile number: ${data.targetUserMobile}`);
    }
  } catch (error) {
    console.error('Error adding target user details:', error);

    // Send error response
    ws.send(JSON.stringify({
      type: 'user_contact_added',
      success: false,
      error: error.message,
    }));
  }
}

async function handleCallUser(data, ws) {
  const { callerId, calleeId } = data;
  const callId = new ObjectId();

  console.log("incoming call data", data);

  if (clients[calleeId]) {
    await callHistoryCollection.insertOne({
      _id: callId,
      caller: ObjectId.createFromHexString(callerId),
      callee: ObjectId.createFromHexString(calleeId),
      startTime: new Date(),
      status: 'ringing',
    });

    let callerDetails = await usersCollection.findOne({ _id: ObjectId.createFromHexString(callerId) })

    console.log("Calling user with", callerDetails);

    clients[callerId].send(JSON.stringify({
      type: 'call_initiated',
      success: true,
      details: {
        callerId,
        callerMobile: callerDetails.mobile,
        calleeId,
        callId: callId.toString(),
      }
    }));

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

  await callHistoryCollection.updateOne({ _id: ObjectId.createFromHexString(callId) }, { $set: { status: 'accepted' } });

  if (clients[callerId]) {
    clients[callerId].send(JSON.stringify({
      type: 'call_accepted',
      callerId,
      calleeId,
      callId,
      success: true,
    }));
    console.log(`Call accepted by ${calleeId} from ${callerId}`);
  }
}

async function handleOffer(data, ws) {
  const { callId, callerId, calleeId, sdp } = data;

  console.log("offder sdp ->", sdp);

  if (clients[calleeId]) {
    await callsSdpIceCollection.insertOne({
      callId: ObjectId.createFromHexString(callId),
      callerId: ObjectId.createFromHexString(callerId),
      calleeId: ObjectId.createFromHexString(calleeId),
      sdp,
      type: 'offer',
      timestamp: new Date(),
      documentType: 'sdp',
    });

    clients[calleeId].send(JSON.stringify({
      type: 'offer',
      callerId,
      calleeId,
      callId,
      sdp,
      success: true,
    }));
    console.log(`Offer sent from ${callerId} to ${calleeId}`);
  } else {
    console.log(`Callee ${calleeId} not found or offline`);
  }
}

async function handleAnswer(data, ws) {
  const { callId, callerId, calleeId, sdp } = data;


  console.log("answer sdp ->", sdp);
  
  if (clients[callerId]) {
    console.log(`Answer from ${calleeId} to ${callerId}`);
    await callsSdpIceCollection.insertOne({
      callId: ObjectId.createFromHexString(callId),
      calleeId: ObjectId.createFromHexString(calleeId),
      callerId: ObjectId.createFromHexString(callerId),
      sdp,
      type: 'answer',
      timestamp: new Date(),
      documentType: 'sdp',
    });

    clients[callerId].send(JSON.stringify({
      type: 'answer',
      callerId,
      calleeId,
      callId,
      sdp,
      success: true,
    }));
    console.log(`Answer sent from ${calleeId} to ${callerId}`);
  } else {
    console.log(`Caller ${callerId} not found or offline`);
  }
}

async function handleICE(data, ws) {
  const { callId, callerId, calleeId, ice, iceUser } = data;

  console.log("iceUser ", iceUser);
  

  if (iceUser === "caller") {
    if (clients[calleeId]) {
      await callsSdpIceCollection.insertOne({
        callId: ObjectId.createFromHexString(callId),
        calleeId: ObjectId.createFromHexString(calleeId),
        callerId: ObjectId.createFromHexString(callerId),
        ice,
        type: 'ice',
        timestamp: new Date(),
        documentType: 'ice',
      });
  
      clients[calleeId].send(JSON.stringify({
        type: 'ice',
        callerId,
        calleeId,
        callId,
        ice,
        documentType: 'ice',
        success: true,
      }));
      console.log(`ICE Candidate sent from ${calleeId} to ${callerId}`);
    } else {
      console.log(`Caller ${callerId} not found or offline`);
    }
  } else {
    if (clients[callerId]) {
      await callsSdpIceCollection.insertOne({
        callId: ObjectId.createFromHexString(callId),
        calleeId: ObjectId.createFromHexString(calleeId),
        callerId: ObjectId.createFromHexString(callerId),
        ice,
        type: 'ice',
        timestamp: new Date(),
        documentType: 'ice',
      });
  
      clients[callerId].send(JSON.stringify({
        type: 'ice',
        callerId,
        calleeId,
        callId,
        ice,
        documentType: 'ice',
        success: true,
      }));
      console.log(`ICE Candidate sent from ${calleeId} to ${callerId}`);
    } else {
      console.log(`Caller ${callerId} not found or offline`);
    }
  }
}

async function handleReconnect(data, ws) {
  console.log("Reconnecting from caller");
  
  const { callId, callerId, calleeId} = data;
  clients[callerId].send(JSON.stringify({
    type: 'reconnect',
    callerId,
    calleeId,
    callId,
    success: true,
  }));
}

app.get('/', (req, res) => {
  res.send('WebRTC Signaling Server');
});

server.listen(3000, () => {
  console.log('Signaling Server is listening on port 3000');
});
