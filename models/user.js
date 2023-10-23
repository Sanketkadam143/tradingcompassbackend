import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  picture: { type: String, default: "" },
  orderDetails: { type: Array, default: [] },
  margin: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  investedProfit: { type: Number, default: 0 },
  contest: { type: Boolean, default: false }
})



export default mongoose.model('User', userSchema);