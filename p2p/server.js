import dotenv from "dotenv";
import express, { json } from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import { connect } from "mongoose";
import userRoutes from "./routes/UserRoutes.js";
import authRoutes from "./routes/AuthRoutes.js";
import User from "./models/UserModel.js";
import visionRoutes from "./routes/VisionRoutes.js";
import CallHistory from "./models/CallHistoryModel.js";
import CallSdpIce from "./models/CallSdpIceModel.js";
import { ObjectId } from "mongodb";
import RefreshToken from "./models/RefreshToken.js";
import pkg from "jsonwebtoken";
import { createHash } from "crypto";
import forge from "node-forge";
// const { verify } = require("@noble/secp256k1");

const { sign } = pkg;

dotenv.config();

let verify;
(async () => {
  const secp = await import("@noble/secp256k1");
  verify = secp.verify;
})();

const app = express();
app.use(json());
app.use(cors());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/p2p";

const pending = new Map(); // token -> { publicKey, signature, wsClient }
const usedSignatures = new Set();
const TOKEN_EXPIRY = 30; // seconds

connect(uri, {})
  .then((client) => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

let clients = {};

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vision", visionRoutes);

app.get("/", (req, res) => {
  res.send("WebRTC Signaling Server");
});

const generateToken = (userId) => {
  return sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

const tokenStore = new Map(); // This stores the original token data

async function generateRefreshToken(userId) {
  const token = sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Set expiry date to 7 days

  // Save refresh token to the database
  const refreshToken = new RefreshToken({ userId, token, expiresAt });
  await refreshToken.save();
  return token;
}

wss.on("connection", (ws) => {
  console.log("New client connected");

  // Listen for incoming messages
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("initial data", data);
      switch (data.type) {
        case "sendMobileNumber":
          await handleSendMobileNumber(data, ws);
          break;
        case "registerToVerifyMobileNumber":
          await handleRegisterToVerifyMobileNumber(data, ws);
          break;
        case "change_user_status":
          await handleChangeUserStatus(data, ws);
          break;
        case "call_user":
          await handleCallUser(data, ws);
          break;
        case "accept_call":
          await handleAcceptCall(data, ws);
          break;
        case "call_rejected":
          await handleCallRejected(data, ws);
          break;
        case "offer":
          await handleOffer(data, ws);
          break;
        case "answer":
          await handleAnswer(data, ws);
          break;
        case "ice":
          await handleICE(data, ws);
          break;
        default:
          console.log("Unknown message type:", data.type);
          break;
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  ws.on("close", () => {
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

function isFreshToken(token) {
  const [code, tsStr] = token.split("|");
  const ts = parseInt(tsStr, 10);
  return Math.abs(Math.floor(Date.now() / 1000) - ts) <= TOKEN_EXPIRY;
}
// async function handleSendMobileNumber(data, ws) {
//   const { token, mobileNo } = data;

//   console.log("sendMobileNumber: mobileNo ", mobileNo);

//   // Lookup the token
//   const entry = tokenStore.get(token);

//   if (!entry) {
//     return res.status(404).json({ error: "Token not found" });
//   }

//   //   // Check public key match
//   //   if (entry.publicKey !== publicKey) {
//   //     return res.status(403).json({ error: "Public key mismatch" });
//   //   }

//   //   // Verify the signature using the public key
//   //   const verify = crypto.createVerify("SHA256");
//   //   verify.update(token);
//   //   verify.end();
//   //   const isValid = verify.verify(
//   //     publicKey,
//   //     Buffer.from(signatureBase64, "base64")
//   //   );

//   //   if (isValid) {
//   const result = await UserModel.create({
//     verifiedToken: token,
//     username: "Hello Famy!",
//     mobileNo: mobileNo,
//     isMobileVerified: true,
//     status: "online",
//   });

//   entry.wsClient.send(
//     JSON.stringify({
//       type: "receivedMobileNumber",
//       success: true,
//       details: result,
//       token: token,
//     })
//   );
//   // return res.status(401).json({ error: "Invalid signature" });
//   //   }

//   // All good! Return the associated mobile number
//   //   return res.json({ mobile_number: entry.mobile_number });

//   //   const result = await UserModel.create({
//   //     verifiedToken: userId,
//   //     username: "Hello Famy!",
//   //     mobileNo: mobileNo,
//   //     isMobileVerified: true,
//   //     status: "online",
//   //   });

//   //   // console.log("clients", clients);

//   //   const token = generateToken(result._id);

//   //   // Generate and save a new refresh token
//   //   const refreshToken = await generateRefreshToken(result._id);

//   //   clients[userId].send(
//   //     JSON.stringify({
//   //       type: "receivedMobileNumber",
//   //       success: true,
//   //       details: result,
//   //       token: token,
//   //       refreshToken: refreshToken,
//   //     })
//   //   );

//   //   if (result.modifiedCount > 0) {
//   //     console.log(`User ${userId} created`);
//   //   } else {
//   //     console.log(`Failed to update status for user ${userId}`);
//   //   }
// }

// async function handleRegisterToVerifyMobileNumber(data, ws) {
//   const { token, publicKey, signature } = data;

//   try {
//     // const verify = crypto.createVerify("SHA256");
//     // verify.update(token);
//     // const isValid = verify.verify(publicKey, signature, 'base64');
//     const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
//     const md = forge.md.sha256.create();
//     md.update(token, "utf8");
//     const signatureBytes = forge.util.decode64(signature);
//     const isValid = publicKeyObj.verify(md.digest().bytes(), signatureBytes);

//     if (isValid) {
//       clients[token] = ws;

//       tokenStore.set(token, {
//         token,
//         publicKey,
//         signature,
//         wsClient: ws,
//         timestamp: Date.now(),
//       });
//     }
//   } catch (e) {
//     console.error(e);
//   }

//   console.log(`User ${token} registered to verify mobile number`);
// }
async function handleSendMobileNumber(data, ws) {
  const { token, mobileNo, signature } = data;

  const entry = pending.get(token);

  if (!entry) {
    return ws.send(
      JSON.stringify({
        type: "verification_result",
        success: false,
        error: "Not found",
      })
    );
  }
  if (!isFreshToken(token)) {
    return ws.send(
      JSON.stringify({
        type: "verification_result",
        success: false,
        error: "Expired",
      })
    );
  }

  const fp = createHash("sha256")
    .update(token + entry.signature)
    .digest("hex");

  if (usedSignatures.has(fp)) {
    return ws.send(
      JSON.stringify({
        type: "verification_result",
        success: false,
        error: "Replay",
      })
    );
  }

  console.log("entry.signature", entry.signature);
  console.log("entry.publicKey", entry.publicKey);
  console.log("entry.token", entry.token);

  // Verify Device A's signature
  const ok = verify(entry.signature, token, entry.publicKey);
  if (!ok) {
    return ws.send(
      JSON.stringify({
        type: "verification_result",
        success: false,
        error: "Invalid sig",
      })
    );
  }
  usedSignatures.add(fp);
  setTimeout(() => usedSignatures.delete(fp), TOKEN_EXPIRY * 1000);

  const result = await User.create({
    username: "Hello Famy!",
    mobileNo: mobileNo,
    isMobileVerified: true,
    status: "online",
    publicKey: entry.publicKey,
  });

  // Send result back to Device A
  entry.wsClient.send(
    JSON.stringify({
      type: "receivedMobileNumber",
      success: true,
      details: result,
    })
  );
  // Acknowledge SS Mobile
  ws.send(JSON.stringify({ type: "verification_result", success: true }));
  pending.delete(token);
}

// async function handleRegisterToVerifyMobileNumber(data, ws) {
//   const { token, publicKey, signature } = data;

//   try {
//     // const verify = crypto.createVerify("SHA256");
//     // verify.update(token);
//     // const isValid = verify.verify(publicKey, signature, 'base64');
//     const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
//     const md = forge.md.sha256.create();
//     md.update(token, "utf8");
//     const signatureBytes = forge.util.decode64(signature);
//     const isValid = publicKeyObj.verify(md.digest().bytes(), signatureBytes);

//     if (isValid) {
//       clients[token] = ws;

//       tokenStore.set(token, {
//         token,
//         publicKey,
//         signature,
//         wsClient: ws,
//         timestamp: Date.now(),
//       });
//     }
//   } catch (e) {
//     console.error(e);
//   }

//   console.log(`User ${token} registered to verify mobile number`);
// }

async function handleRegisterToVerifyMobileNumber(data, ws) {
  const { token, publicKey, signature } = data;

  // if (!isFreshToken(token)) {
  //   return ws.send(
  //     JSON.stringify({
  //       type: "register_ack",
  //       success: false,
  //       error: "Token expired",
  //     })
  //   );
  // }

  const ok = verify(
    {
      r: 15666702647480829550598693466342986441269198210259882154991347122072504868727n,
      recovery: 0,
      s: 45544941265075466790152241231846112018346250443931600218856083126866955290042n,
    },
    [
      129, 156, 81, 175, 161, 209, 243, 212, 187, 52, 203, 201, 36, 17, 243,
      191, 48, 52, 109, 63, 251, 128, 179, 246, 185, 156, 161, 164, 230, 172,
      171, 62,
    ],
    [
      3, 60, 154, 112, 40, 40, 3, 152, 66, 77, 234, 32, 4, 64, 106, 222, 118,
      36, 77, 2, 152, 228, 70, 51, 143, 85, 196, 27, 12, 83, 88, 209, 184,
    ]
  );
  console.log("ok -> ", ok);

  console.log("token ->", token);
  console.log("signature ->", signature);
  console.log("publicKey ->", publicKey);

  const parsedSignature = JSON.parse(signature);
  const newSignature = {
    s: BigInt(parsedSignature.s),
    r: BigInt(parsedSignature.r),
    recovery: Number.parseInt(parsedSignature.recovery),
  };

  const publicKeyParsed = JSON.parse(publicKey);

  console.log(
    "publicKeyParsed",
    publicKeyParsed.publicKey,
    " - typeof ->",
    typeof publicKeyParsed.publicKey
  );

  // pending.set(token, {
  //   publicKey: Object.values(publicKeyParsed.publicKey),
  //   signature: newSignature,
  //   wsClient: ws,
  // });

  ws.send(JSON.stringify({ type: "register_ack", success: true }));
  console.log(`User ${token} registered to verify mobile number`);
}

async function handleChangeUserStatus(data, ws) {
  const { userId, status } = data;
  if (status === "online") {
    clients[userId] = ws;
  }
  console.log("data ", data);

  if (userId === undefined) {
    console.log("UserId is undefined");
    return;
  }

  const result = await updateOne(
    { _id: ObjectId.createFromHexString(userId) },
    { $set: { status } }
  );

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
    await CallHistory.create({
      _id: callId,
      callerId: ObjectId.createFromHexString(callerId),
      calleeId: ObjectId.createFromHexString(calleeId),
      status: "ringing",
    });

    let callerDetails = findOne({
      _id: ObjectId.createFromHexString(callerId),
    });

    clients[calleeId].send(
      JSON.stringify({
        type: "incoming_call",
        success: true,
        details: {
          callerId,
          callerMobile: callerDetails.mobileNo,
          calleeId,
          callId: callId.toString(),
        },
      })
    );

    console.log(`Call initiated from ${callerId} to ${calleeId}`);
  } else {
    console.log(`Callee ${calleeId} not found or offline`);
    ws.send(
      JSON.stringify({
        type: "call_failed",
        reason: "Callee not found or offline",
      })
    );
  }
}

async function handleAcceptCall(data, ws) {
  const { callerId, calleeId, callId } = data;

  await CallHistory.findOneAndUpdate(
    { _id: ObjectId.createFromHexString(callId) },
    { $set: { status: "accepted" } }
  );

  if (clients[callerId]) {
    clients[callerId].send(
      JSON.stringify({
        type: "call_accepted",
        callerId,
        calleeId,
        callId,
      })
    );
    console.log(`Call accepted by ${calleeId} from ${callerId}`);
  }
}

async function handleCallRejected(data, ws) {
  const { callerId, calleeId, callId } = data;

  await CallHistory.findOneAndUpdate(
    { _id: ObjectId.createFromHexString(callId) },
    { $set: { status: "rejected" } }
  );

  if (clients[callerId]) {
    clients[callerId].send(
      JSON.stringify({
        type: "call_rejected",
        callerId,
        calleeId,
        callId,
      })
    );
    console.log(`Call rejected by ${calleeId} from ${callerId}`);
  }
}

async function handleOffer(data, ws) {
  const { callId, callerId, calleeId, sdp } = data;

  if (clients[calleeId]) {
    await CallSdpIce.create({
      callId: ObjectId.createFromHexString(callId),
      callerId: ObjectId.createFromHexString(callerId),
      calleeId: ObjectId.createFromHexString(calleeId),
      sdp,
      type: "offer",
    });

    clients[calleeId].send(
      JSON.stringify({
        type: "offer",
        callId,
        callerId,
        calleeId,
        sdp,
      })
    );

    console.log(`Offer sent from ${callerId} to ${calleeId}`);
  } else {
    console.log(`Callee ${calleeId} not found or offline`);
  }
}

async function handleAnswer(data, ws) {
  const { callId, callerId, calleeId, sdp } = data;

  if (clients[callerId]) {
    await __create({
      callId: ObjectId.createFromHexString(callId),
      callerId: ObjectId.createFromHexString(callerId),
      calleeId: ObjectId.createFromHexString(calleeId),
      sdp,
      type: "answer",
    });

    clients[callerId].send(
      JSON.stringify({
        type: "answer",
        callId,
        callerId,
        calleeId,
        sdp,
      })
    );
    console.log(`Answer sent from ${calleeId} to ${callerId}`);
  } else {
    console.log(`Caller ${callerId} not found or offline`);
  }
}

async function handleICE(data, ws) {
  const { callId, callerId, calleeId, ice } = data;

  if (clients[calleeId]) {
    await __create({
      callId: ObjectId.createFromHexString(callId),
      callerId: ObjectId.createFromHexString(callerId),
      calleeId: ObjectId.createFromHexString(calleeId),
      ice,
      type: "ice",
    });

    clients[calleeId].send(
      JSON.stringify({
        type: "ice",
        callerId,
        calleeId,
        ice,
      })
    );

    console.log(`Ice sent from ${callerId} to ${calleeId}`);
  } else {
    console.log(`Callee ${calleeId} not found or offline`);
  }
}

// console.log(generateToken("6736caf3987f91ea19b614b1"));
// console.log(generateToken("673d6191936faca4b761c671"));
// console.log(generateToken("6746ca65bbe5082648eee529"));

server.listen(5000, () => {
  console.log("Signaling Server is listening on port 5000");
});
