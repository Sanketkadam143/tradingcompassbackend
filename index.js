import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression";
import * as dotenv from "dotenv";
dotenv.config();

import apisRoutes from "./routes/apis.js";
import userRoutes from "./routes/users.js";
import contestRoutes from "./routes/contestRoutes.js";

import db from "./config/db.js";
import dbwatch from "./config/dbwatch.js";
import sockets from "./config/sockets.js";
import fetchNSE from "./utils/fetchNSE.js";
import updateProfit from "./controllers/updateProfit.js";

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 5000;

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
app.use("/contest", contestRoutes);
dbwatch(io);
//start server after db connect
db()
  .then((database) => {
    server.listen(PORT, () =>
      console.log(`Server Running on Port: http://localhost:${PORT}`)
    );
    sockets(io, database);
    updateProfit(io, database);
    fetchNSE();
  })
  .catch((error) => {
    console.log(error);
  });
