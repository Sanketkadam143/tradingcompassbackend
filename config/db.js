import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const CONNECTION_URL = process.env.CONNECTION_URL;
let database;

export default function db() {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(CONNECTION_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        compressors: ["snappy"],
      })
      .then(() => {
        database = mongoose.connection;
        resolve(database);
      })
      .catch((error) => {
        console.log(`${error} did not connect`);
        reject(error);
      });
  });
}
