import { Schema, model } from 'mongoose';

const callSdpIceSchema = new Schema({
    callId: { type: Schema.Types.ObjectId, ref: 'CallHistory', required: true },
    callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    calleeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

callSdpIceSchema.pre('save', async function (next) {
    this.createdAt = Date.now();
    next();
});

export default model('CallSdpIce', callSdpIceSchema);
