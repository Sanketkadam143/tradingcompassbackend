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
    type: String,
    required: true,
  },
  marketStatus: {
    type: marketStatusSchema,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
});

const stocks = mongoose.model("stock", stocksSchema);

export async function getStocks() {

  let config = {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      "Content-Length":"",
      "Access-Control-Allow-Origin": "*",
      "Accept":"*/*",
      "Accept-Encoding":"gzip, deflate, br",
      "Connection":"keep-alive",
      "Access-Control-Allow-Origin":"*",
    }
  }


  axios
    .get(process.env.STOCKS_API,config)
    .then(async (res) => {
      const response = await res.data;
      const data = response.data;
      try {
        const result = await stocks({
          _id: response["timestamp"],
          marketStatus: {
            marketStatus: response?.marketStatus?.marketStatus,
            tradeDate: response?.marketStatus?.tradeDate,
          },
        });
        await result.save();
        const stockarr = [];
        for (let i = 0; i < data.length; i++) {
          const stocksData = {
            symbol: data[i]?.symbol,
            last: data[i]?.lastPrice,
            variation: data[i]?.change,
            percentChange: data[i]?.pChange,
          };
          stockarr.push(stocksData);
        }

        await stocks.findByIdAndUpdate(
          { _id: response["timestamp"] },
          {
            $addToSet: {
              data: stockarr,
            },
          }
        );
      } catch (error) {
        console.log("same stock response");
      }
    })
    .catch((error) => {
      console.log("no response for stock");
    });
}
