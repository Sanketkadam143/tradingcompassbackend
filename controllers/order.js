import mongoose from "mongoose";
import order from "../models/order.js";
import User from "../models/user.js";
import getName from "../utils/orderName.js";

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
  const orderName = getName(orderDetails);

  try {
    const info = await User.findById({ _id: userId }, { margin: 1 });
    const newMargin = Math.round(parseInt(info.margin) + parseInt(orderDetails.margin));
    if (newMargin > 100000) {
      return res.status(400).json({ message: "You Don't Have Enough Margin" });
    }
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $addToSet: { orderDetails: newOrder },
        $set: { margin: newMargin },
      }
    );

    res.status(200).json({
      newOrder,
      successMessage: `Your Order for ${orderName} was Successfully Placed`,
    });
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
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ message: "Invalid OrderId" });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orderIndex = user.orderDetails.findIndex(
      (order) => order._id.toString() === _id
    );

    if (orderIndex === -1) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderDetails = user.orderDetails[orderIndex];
    if (orderDetails.exitTime) {
      return res.status(400).json({ message: "Order Already Exited" });
    }

    const updatedPosition = { ...orderDetails, ...details };

    const newMargin = Math.round(user.margin - orderDetails.margin);
    const orderName = getName(orderDetails);

    user.orderDetails[orderIndex] = updatedPosition;
    user.margin = newMargin;
    await user.save();

    res.status(200).json({
      updatedPosition,
      successMessage: `Your order for ${orderName} was Successfully Exited !!!`,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};


export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  var _id = mongoose.Types.ObjectId(id);

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ message: "Invalid OrderId" });
  }

  try {
    const user = await User.findOne(
      { _id: userId },
      { contest: 1, orderDetails: 1 }
    );
    if (user.contest) {
      return res
        .status(400)
        .json({ message: "You cannot delete order history while in contest" });
    }

    const orderDetails = user.orderDetails.find(
      (order) => order._id.toString() === id
    );

    if (!orderDetails) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderName = getName(orderDetails);

    await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { orderDetails: { _id: _id } } }
    );

    res.status(200).json({
      successMessage: `Order History for ${orderName} was Deleted Successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};
