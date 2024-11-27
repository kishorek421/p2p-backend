const mongoose = require('mongoose');

const userRequestSchema = new mongoose.Schema({
    requestedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestStatus: { type: String },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean },
});

userRequestSchema.pre('save', async function (next) {
    this.createdAt = Date.now;
    this.requestStatus = "Requested";
    this.isActive = true;
    next();
});

// requestStatus - Requested, Accepted

module.exports = mongoose.model('UserRequest', userRequestSchema);