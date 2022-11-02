import mongoose from "mongoose";
import order from "../models/order.js";
import User from "../models/user.js";

export const getOrderBook = async (req, res) => {
  const userId = req.userId;

  try {
    const userDetails = await User.find({ _id: userId });

    const orderBook = userDetails[0]?.orderDetails;

    res.status(200).json(orderBook);
  } catch (error) {
    res.status(500).json({ message: "Unable to Fetch Order Book" });
    console.log(error);
  }
};

export const placeOrder = async (req, res) => {
  const userId = req.userId;
  const orderDetails = req.body;
  const newOrder = new order(orderDetails);
  const orderName =
  orderDetails.indexName +
  " " +
  orderDetails.stp +
  " " +
  orderDetails.optionType +
  " " +
  (orderDetails.orderType === "optionBuying"
    ? "Option Buying"
    : "Option Selling");

  try {
    await User.findByIdAndUpdate(
      { _id: userId },
      { $addToSet: { orderDetails: newOrder } }
    );

    res
      .status(200)
      .json({ newOrder, successMessage: `Your Order for ${orderName } was Successfully Placed` });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const updateOrder = async (req, res) => {
  const { id: _id } = req.params;
  const details = req.body;
  const userId = req.userId;
  var id = mongoose.Types.ObjectId(_id);
  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("No order with that id");

    const exitPosition = await User.find(
      { _id: userId },
      { orderDetails: { $elemMatch: { _id: id } } }
    );

    const orderDetails = exitPosition[0].orderDetails[0];
    const updatedPosition = { ...orderDetails, ...details };

    const orderName =
    orderDetails.indexName +
    " " +
    orderDetails.stp +
    " " +
    orderDetails.optionType +
    " " +
    (orderDetails.orderType === "optionBuying"
      ? "Option Buying"
      : "Option Selling");

    await User.findOneAndUpdate(
      { _id: userId, orderDetails: { $elemMatch: { _id: id } } },
      { $set: { "orderDetails.$": { ...updatedPosition } } }
    );

    res.json({updatedPosition,successMessage:`Your order for ${orderName} was Successfully Exited !!!`});
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  var _id = mongoose.Types.ObjectId(id);

  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("No order with that id");

      const position = await User.find(
        { _id: userId },
        { orderDetails: { $elemMatch: { _id: _id } } }
      );

      const orderDetails = position[0].orderDetails[0];
  
      const orderName =
      orderDetails.indexName +
      " " +
      orderDetails.stp +
      " " +
      orderDetails.optionType +
      " " +
      (orderDetails.orderType === "optionBuying"
        ? "Option Buying"
        : "Option Selling");


    await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { orderDetails: { _id: _id } } }
    );
    res.json({ successMessage: `Order History for ${orderName} was Deleted Successfully` });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};
