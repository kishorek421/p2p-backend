import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatically delete expired tokens

const RefreshToken = model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
