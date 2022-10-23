import mongoose from "mongoose";
import order from "../models/order.js";


export const getOrderBook = async (req, res) => {
  try {
    const orderBook = await order.find();
  
    res.status(200).json(orderBook);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const placeOrder = async (req, res) => {
  const OrderDetails = req.body;
  const newOrder = new order({...OrderDetails,creator:req.userId,createdAt:new Date().toISOString()});
  try {
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  const { id: _id } = req.params;
  const details=req.body;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No order with that id");

    const exitPosition=await order.findByIdAndUpdate(_id,{...details,_id},{new:true});

    res.json(exitPosition);
};


export const deleteOrder=async(req,res)=>{
    const {id}= req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No order with that id");

    await order.findOneAndRemove(id);
    res.json({message:"Order History Deleted Successfully"});
}
