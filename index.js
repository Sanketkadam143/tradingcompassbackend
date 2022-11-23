import express from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression";
// import apicache from "apicache";
import nocache from "nocache";
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

// //configure apicache 
// let cache = apicache.middleware
  
// //caching all routes for 5 minutes
// app.use(cache('5 minutes'))

//disabling client side cache
app.use(nocache());
app.set('etag', false);

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
