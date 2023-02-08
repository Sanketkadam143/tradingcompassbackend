import mongoose from "mongoose";
import User from "../models/user.js";

export default function dbwatch (io) {
  //keep listening to mongodb changes and update socket data
  const database=mongoose.connection;
  database.once("open", (error) => {
    if (error) {
      console.log("Database connection failed: ", error);
      return;
    }
    try {
      const data = database.collection("stocks");
      const changeStream = data.watch();
      changeStream.on("change", (next) => {
        switch (next.operationType) {
          case "insert":
            const res = next.fullDocument;
            io.emit("stocks", [res]);
            break;
          case "update":
            //const updated = next.updateDescription.updatedFields;
            //console.log(updated);
            break;
        }
      });
    } catch (error) {
      console.log(error);
    }

    try {
      const data = database.collection("index prices");
      const changeStream = data.watch();
      changeStream.on("change", (next) => {
        switch (next.operationType) {
          case "insert":
            const res = next.fullDocument;
            io.emit("indexprice", [res]);
            break;
          case "update":
            //const updated = next.updateDescription.updatedFields;
            //console.log(updated);
            break;
        }
      });
    } catch (error) {
      console.log(error);
    }

    try {
      const data = database.collection("nifty options");
      const changeStream = data.watch();
      changeStream.on("change", (next) => {
        switch (next.operationType) {
          case "insert":
            const res = next.fullDocument;
            io.emit("niftydata", [res]);
            break;
          case "update":
            const updated = next.updateDescription.updatedFields.datedata;
            const latest = updated[updated.length - 1];
            io.emit("updateNifty", latest);
            break;
        }
      });
    } catch (error) {
      console.log(error);
    }

    try {
      const data = database.collection("bank nifty options");
      const changeStream = data.watch();
      changeStream.on("change", (next) => {
        switch (next.operationType) {
          case "insert":
            const res = next.fullDocument;
            io.emit("bankdata", [res]);
            break;
          case "update":
            const updated = next.updateDescription.updatedFields.datedata;
            const latest = updated[updated.length - 1];
            io.emit("updateBank", latest);
            break;
        }
      });
    } catch (error) {
      console.log(error);
    }

    // try {
    //   const data = database.collection("users");
    //   const changeStream = data.watch();
    //   changeStream.on("change", (next) => {
    //     switch (next.operationType) {
    //       case "insert":
    //         break;
    //       case "update":
    //         const finduser = async () => {
    //           const userDetails = await User.find({ _id: updatedUser });
    //           const orderDetails = userDetails[0].orderDetails;
    //           connectedUsers.forEach((users) => {
    //             if (users.userId == updatedUser) {
    //               io.to(users.socketId).emit("updateOrders", orderDetails);
    //             }
    //           });
    //         };
    //         const updatedUser = next.documentKey._id;
    //         finduser();
    //         break;
    //     }
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
  });
}
