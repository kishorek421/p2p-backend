import { Schema, model } from 'mongoose';

const callHistorySchema = new Schema({
    callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    calleeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true},
    createdAt: { type: Date, default: Date.now },
});

callHistorySchema.pre('save', async function (next) {
    this.createdAt = Date.now;
    next();
});

export default model('CallHistory', callHistorySchema);
