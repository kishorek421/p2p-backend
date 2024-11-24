const mongoose = require('mongoose');

const callHistorySchema = new mongoose.Schema({
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    calleeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true},
    createdAt: { type: Date, default: Date.now },
});

callHistorySchema.pre('save', async function (next) {
    this.createdAt = Date.now;
    next();
});

module.exports = mongoose.model('CallHistory', callHistorySchema);
