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
  data: {
    type: Array,
    required: true,
  },
});

const liveprice = mongoose.model("Index Price", livePriceSchema);

export async function getLivePrice() {

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
    .get(process.env.LIVEPRICE_API,config)
    .then(async (res) => {
      const response = await res.data;
      const data = response.data;
      const timestamp= response["timestamp"];

      try {
        const result = await liveprice({
          _id: timestamp,
          timestamp:timestamp,
        });
        await result.save();
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
        await liveprice.findOneAndUpdate(
          { _id: timestamp },
          {
            $addToSet: {
              data: indexdata,
            },
          }
        );
      } catch (error) {
        console.log("same index price response");
      }
    })
    .catch((error) => {
      console.log("no index response");
    });
}
