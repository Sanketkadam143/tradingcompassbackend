import express from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import apisRoutes from "./routes/apis.js";
import userRoutes from "./routes/users.js";
import mongoose from "mongoose";
import { getNiftyData } from "./ApiResponse/nifty.js";
import { getbankNiftyData } from "./ApiResponse/banknifty.js";
import { getLivePrice } from "./ApiResponse/livePrice.js";
import { getStocks } from "./ApiResponse/stocks.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.CONNECTION_URL;
var database;

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

app.get("/api/nifty", async (req, res) => {
  await database
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
  await database
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
  await database
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
  await database
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

try {
  if (date.getDay() !== 0 && date.getDay() !== 6) {
    if (date.getHours() >= 9 && date.getHours() <= 16) {
      setInterval(() => {
        getNiftyData();
        getbankNiftyData();
        getLivePrice();
        getStocks();
      }, 20000);
    }
  }
} catch (error) {
  console.log(error);
}

mongoose.connect(CONNECTION_URL);

MongoClient.connect(CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  compressors: ["snappy"],
})
  .then(
    (result) => (database = result.db("test")),
    app.listen(PORT, () =>
      console.log(`Server Running on Port: http://localhost:${PORT}`)
    )
  )
  .catch((error) => console.log(`${error} did not connect`));
