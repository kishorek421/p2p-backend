const mongoose = require('mongoose');

const userRequestSchema = new mongoose.Schema({
    requestedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isAccepted: { type: Boolean },
    createdAt: { type: Date },
    isActive: { type: Boolean },
});

userRequestSchema.pre('save', async function (next) {
    this.createdAt = Date.now;
    this.isAccepted = false;
    this.isActive = true;
    next();
});

module.exports = mongoose.model('UserRequest', userRequestSchema);