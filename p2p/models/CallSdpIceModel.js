const mongoose = require('mongoose');

const callSdpIceSchema = new mongoose.Schema({
    callId: { type: mongoose.Schema.Types.ObjectId, ref: 'CallHistory', required: true },
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    calleeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

callSdpIceSchema.pre('save', async function (next) {
    this.createdAt = Date.now;
    next();
});

module.exports = mongoose.model('CallSdpIce', callSdpIceSchema);
