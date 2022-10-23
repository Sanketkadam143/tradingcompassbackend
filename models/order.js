import mongoose from "mongoose";

const orderSchema= mongoose.Schema({
indexName:String,
stp:Number,
optionType:String,
buyPrice:Number,
lots:String,
entryTime:String,
orderType:String,
margin:Number,
sellPrice:Number,
profit:Number,
exitTime:String,

});

const order=mongoose.model('OrderDetail',orderSchema);

export default order;

