import mongoose from "mongoose";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const livePriceSchema = mongoose.Schema({
  _id: {
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
  axios
    .get(process.env.LIVEPRICE_API)
    .then(async (res) => {
      const response = await res.data;
      const data = response.data;

      try {
        const result = await liveprice({
          _id: response["timestamp"],
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
        await liveprice.findByIdAndUpdate(
          { _id: response["timestamp"] },
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
      console.log("no response for indexprice");
    });
}
