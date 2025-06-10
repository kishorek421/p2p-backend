import { Schema, model } from "mongoose";

const userRequestSchema = new Schema({
  requestedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
  requestedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
  requestStatus: { type: String },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean },
});

userRequestSchema.pre("save", async function (next) {
  this.createdAt = Date.now;
  this.requestStatus = "Requested";
  this.isActive = true;
  next();
});

// requestStatus - Requested, Accepted

export default model("UserRequest", userRequestSchema);
