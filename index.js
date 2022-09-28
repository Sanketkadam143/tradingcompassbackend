import express from "express";
const app = express();
import cors from "cors";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();



const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.CONNECTION_URL;
var database;


app.use(
  cors({
    origin: "*",
  })
);

app.get("/api/nifty", async (req, res) => {
   await database.collection("nifty options").find({}).sort({_id:-1}).limit(1).toArray((err, result) => {
    try {
      const data=result[0].datedata;
      const recent=data[data.length-1];
      res.send(recent);
    } catch (err) {}
  });
 
});

app.get("/api/banknifty", async (req, res) => {
    await database.collection("bank nifty options").find({}).sort({_id:-1}).limit(1).toArray((err, result) => {
        try {
          const data=result[0].datedata;
          const recent=data[data.length-1];
          res.send(recent);
        } catch (err) {}
      });
});

app.get("/api/stocks", async (req, res) => {
    await database.collection("stocks").find({}).sort({_id:-1}).limit(1).toArray((err, result) => {
        try {
          res.send(result);
        } catch (err) {}
      });
});

app.get("/api/liveprice", async (req, res) => {
    await database.collection("index prices").find({}).sort({_id:-1}).limit(1).toArray((err, result) => {
        try {
          res.send(result);
        } catch (err) {}
      });
});


MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(
    (result) => (database = result.db("test")),
    app.listen(PORT, () =>
      console.log(`Server Running on Port: http://localhost:${PORT}`)
    )
  )
  .catch((error) => console.log(`${error} did not connect`));
