const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String },
    mobileNo: { type: String, required: true, unique: true },
    isMobileVerified: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean },
    status: { type: String },
    verifiedToken: { type: String },
});

userSchema.pre('save', async function (next) {
    this.createdAt = Date.now;
    this.isActive = true;
    next();
});

module.exports = mongoose.model('User', userSchema);