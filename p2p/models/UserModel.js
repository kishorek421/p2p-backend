import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: { type: String },
  mobileNo: { type: String, required: true, unique: true },
  isMobileVerified: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean },
  status: { type: String },
  verifiedToken: { type: String },
});

userSchema.pre("save", async function (next) {
  this.createdAt = Date.now;
  this.isActive = true;
  next();
});

export default model("User", userSchema);
