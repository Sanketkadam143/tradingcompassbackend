import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
dotenv.config();

const JWTKEY = process.env.JWTKEY;
var connectedUsers = [];

export default function sockets(io, database) {
  io.on("connection", async (socket) => {
    const token = socket.handshake.query.token;
    try {
      const decodedData = jwt.verify(token, JWTKEY);
      connectedUsers.push({ socketId: socket.id, userId: decodedData.id });
      // const userDetails = await User.find({ _id: decodedData.id });
      // const orderBook = userDetails[0]?.orderDetails;
      // socket.emit("updateOrders", orderBook);
    } catch (error) {
      connectedUsers.push({ socketId: socket.id, userId: null });
      console.log("unknown joined");
    }

    console.log(connectedUsers.length);

    socket.on("disconnect", () => {
      connectedUsers.splice(
        connectedUsers.findIndex((object) => {
          return object.socketId == socket.id;
        }),
        1
      );
      console.log(connectedUsers.length);
    });

    socket.on("login", (token) => {
      try {
        const decodedData = jwt.verify(token, JWTKEY);
        connectedUsers.find((obj, i) => {
          if (obj.socketId === socket.id) {
            connectedUsers[i].userId = decodedData.id;
          }
        });
      } catch (error) {
        console.log(error);
      }
    });

    await database
      .collection("nifty options")
      .find({})
      .sort({ _id: -1 })
      .limit(1)
      .toArray((err, result) => {
        try {
          socket.emit("niftydata", result);
        } catch (err) {}
      });

    await database
      .collection("bank nifty options")
      .find({})
      .sort({ _id: -1 })
      .limit(1)
      .toArray((err, result) => {
        try {
          socket.emit("bankdata", result);
        } catch (err) {}
      });

    await database
      .collection("stocks")
      .find({})
      .sort({ _id: -1 })
      .limit(1)
      .toArray((err, result) => {
        try {
          socket.emit("stocks", result);
        } catch (err) {}
      });

    await database
      .collection("index prices")
      .find({})
      .sort({ _id: -1 })
      .limit(1)
      .toArray((err, result) => {
        try {
          socket.emit("indexprice", result);
        } catch (err) {}
      });

    await database
      .collection("users")
      .find(
        { orderDetails: { $ne: [] },contest:true },
        {
          projection: {
            name: 1,
            picture: 1,
            margin: 1,
            investedProfit: 1,
            totalProfit: 1,
          },
        }
      )
      .toArray((err, result) => {
        result.sort(function(a, b) {
          return b.totalProfit - a.totalProfit;
        });
        let top20 = result.slice(0, 20);
        socket.emit("leaderboard", top20);
      });
  });
}
