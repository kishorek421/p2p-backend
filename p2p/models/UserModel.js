const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    mobileNo: { type: String, required: true, unique: true },
    isMobileVerified: { type: Boolean },
    createdAt: { type: Date },
    isActive: { type: Boolean },
});

userSchema.pre('save', async function (next) {
    this.createdAt = Date.now;
    this.isActive = true;
    next();
});

module.exports = mongoose.model('User', userSchema);