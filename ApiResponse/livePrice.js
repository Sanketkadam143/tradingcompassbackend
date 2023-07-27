import mongoose from "mongoose";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const livePriceSchema = mongoose.Schema({
  _id: {
    type: Date,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  indexdata: {
    type: Array,
    required: true,
  },
  createdAt: { type: Date, expires: "10d", default: Date.now },
});

const liveprice = mongoose.model("Index Price", livePriceSchema);

export async function getLivePrice() {
  let config = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      Host: "www.nseindia.com",
      Cookie: "AKA_A2=A",
    },
  };
  

  axios
    .get(process.env.LIVEPRICE_API, config)
    .then(async (res) => {
      const response = await res.data;
      const data = response.data;
      const timestamp = response["timestamp"];

      try {
        const indexdata = [];
        for (let i = 0; i < data.length; i++) {
          const livePriceData = {
            index: data[i]?.index,
            last: data[i]?.last,
            variation: data[i]?.variation,
            percentChange: data[i]?.percentChange,
          };

          indexdata.push(livePriceData);
        }
        const result = await liveprice({
          _id: timestamp,
          timestamp: timestamp,
          indexdata: indexdata,
        });

        await result.save();
      } catch (error) {
        console.log("same index price response");
      }
    })
    .catch((error) => {
      console.log("no index response");
    });
}
