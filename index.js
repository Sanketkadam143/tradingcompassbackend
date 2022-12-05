import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression";
import * as dotenv from "dotenv";
import apisRoutes from "./routes/apis.js";
import userRoutes from "./routes/users.js";
import mongoose from "mongoose";
import { getNiftyData } from "./ApiResponse/nifty.js";
import { getbankNiftyData } from "./ApiResponse/banknifty.js";
import { getLivePrice } from "./ApiResponse/livePrice.js";
import { getStocks } from "./ApiResponse/stocks.js";

dotenv.config();

import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.CONNECTION_URL;
const database = mongoose.connection;
var connectedUsers = 0;

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(
  cors({
    origin: "*",
  })
);
app.use(
  compression({
    level: 9,
    threshold: 0,
  })
);

app.use("/order", apisRoutes);
app.use("/users", userRoutes);

io.on("connection", (socket) => {
  connectedUsers++;
  console.log(connectedUsers);
  //console.log(`User Connected:${socket.id}`);
  socket.on("disconnect", () => {
    connectedUsers--;
    console.log(connectedUsers);
    // console.log(`User Disconnected:${socket.id}`);
  });

  database
    .collection("nifty options")
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray((err, result) => {
      try {
        socket.emit("niftydata", result);
      } catch (err) {}
    });

  database
    .collection("bank nifty options")
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray((err, result) => {
      try {
        socket.emit("bankdata", result);
      } catch (err) {}
    });

  database
    .collection("stocks")
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray((err, result) => {
      try {
        socket.emit("stocks", result);
      } catch (err) {}
    });

  database
    .collection("index prices")
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray((err, result) => {
      try {
        socket.emit("indexprice", result);
      } catch (err) {}
    });
});

app.get("/api/nifty", async (req, res) => {
  database
    .collection("nifty options")
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray((err, result) => {
      try {
        // const data=result[0].datedata;
        // const recent=data[data.length-1];
        res.send(result);
      } catch (err) {}
    });
});

app.get("/api/banknifty", async (req, res) => {
  database
    .collection("bank nifty options")
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray((err, result) => {
      try {
        // const data = result[0].datedata;
        // const recent = data[data.length - 1];
        res.send(result);
      } catch (err) {}
    });
});

app.get("/api/stocks", async (req, res) => {
  database
    .collection("stocks")
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray((err, result) => {
      try {
        res.send(result);
      } catch (err) {}
    });
});

app.get("/api/liveprice", async (req, res) => {
  database
    .collection("index prices")
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray((err, result) => {
      try {
        res.send(result);
      } catch (err) {}
    });
});

//start server after db connect
mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    compressors: ["snappy"],
  })
  .then(
    server.listen(PORT, () =>
      console.log(`Server Running on Port: http://localhost:${PORT}`)
    )
  )
  .catch((error) => console.log(`${error} did not connect`));

//keep listening to mongodb changes and update socket data
database.once("open", () => {
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

  try {
    const data = database.collection("users");
    const changeStream = data.watch();
    changeStream.on("change", (next) => {
      switch (next.operationType) {
        case "insert":
          const res = next.fullDocument;
          //io.emit("bankdata", [res]);
          break;
        case "update":
          const updated = next;
          console.log(updated);
          //io.emit("updateBank", latest);
          break;
      }
    });
  } catch (error) {
    console.log(error);
  }
});

//fetching data from nse
try {
  setInterval(() => {
    //reparsing date for setting timezone
    var ist = new Date().toLocaleString(undefined, {
      timeZone: "Asia/Kolkata",
    });
    var date = new Date(ist);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      if (date.getHours() >= 9 && date.getHours() <= 15) {
        getNiftyData();

        setTimeout(() => {
          getbankNiftyData();
        }, 5000);

        setTimeout(() => {
          getLivePrice();
        }, 10000);

        setTimeout(() => {
          getStocks();
        }, 15000);
      }
    }
  }, 20000);
} catch (error) {
  console.log(error);
}
