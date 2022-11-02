import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
  email:{type:String},
  OTP: { type: String },
  createdAt: { type: Date, expires: '2m', default: Date.now }
});

export default mongoose.model("OTP", otpSchema);

