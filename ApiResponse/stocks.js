import mongoose from "mongoose";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const marketStatusSchema = mongoose.Schema({
  marketStatus: {
    type: String,
    required: true,
  },
  tradeDate: {
    type: String,
    required: true,
  },
});

const stocksSchema = mongoose.Schema({
  _id: {
    type: Date,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  marketStatus: {
    type: marketStatusSchema,
    required: true,
  },
  stockdata: {
    type: Array,
    required: true,
  },
  createdAt: { type: Date, expires: '10d', default: Date.now }
});

const stocks = mongoose.model("stock", stocksSchema);

export async function getStocks() {

  let config = {
    headers: {
      "Accept": "*/*",  
      "Connection": "keep-alive",
      "Host": "www.nseindia.com",
      "Cookie": "AKA_A2=A",
      "User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    },
  };
  
  


  axios
    .get(process.env.STOCKS_API,config)
    .then(async (res) => {
      const response = await res.data;
      const data = response.data;
      const timestamp=response["timestamp"];
      try {
        const stockdata = [];
        for (let i = 0; i < data.length; i++) {
          const Data = {
            symbol: data[i]?.symbol,
            last: data[i]?.lastPrice,
            variation: data[i]?.change,
            percentChange: data[i]?.pChange,
          };
          stockdata.push(Data);
        }

        const result = await stocks({
          _id: timestamp,
          timestamp:timestamp,
          marketStatus: {
            marketStatus: response?.marketStatus?.marketStatus,
            tradeDate: response?.marketStatus?.tradeDate,
          },
          stockdata:stockdata,
        });

        await result.save();
      } catch (error) {
        console.log("same stock response");
      }
    })
    .catch((error) => {
      console.log("no response for stock");
    });
}
