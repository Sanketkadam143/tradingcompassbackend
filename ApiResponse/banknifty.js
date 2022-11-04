import mongoose from "mongoose";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const DateSchema = mongoose.Schema({
  timestamp: {
    type: String,
    required: true,
  },
  indexLTP: {
    type: Number,
    required: true,
  },
  totPEchg: {
    type: Number,
    required: true,
  },
  totCEchg: {
    type: Number,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
});

const bankNiftySchema = mongoose.Schema({
  _id: {
    type: Date,
    required: true,
  },
  underlying: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  datedata: [
    {
      type: DateSchema,
      required: true,
    },
  ],
});
const bankNiftyoption = mongoose.model("bank nifty option", bankNiftySchema);

export async function getbankNiftyData() {
  axios
    .get(process.env.BANKNIFTY_API)
    .then(async (res) => {
      const response = res.data;
      const rawdata = response.filtered?.data;
      const datetime = response?.records?.timestamp.split(" ");
      const date = datetime?.[0];
      const time = datetime?.[1];

      //take roundoff live price to find the index of strike price
      const roundoff = rawdata[60].PE.underlyingValue % 100;
      const bankRoundOffPrice = rawdata[60].PE.underlyingValue - roundoff;

      //finding index of live strike price
      const pricePosition = rawdata?.findIndex(
        (element) => element?.strikePrice === bankRoundOffPrice
      );

      const data = rawdata?.slice(pricePosition - 20, pricePosition + 22);

      if (date !== undefined) {
        try {
          const result = await bankNiftyoption({
            _id: date,
            expiryDate: data[0]?.expiryDate,
            underlying: data[0]?.PE?.underlying,
          });
          await result.save();
        } catch (error) {
          console.log();
        }
      }

      try {
        const strikedata = [];
        let totCEchg = 0;
        let totPEchg = 0;
        for (let i = 0; i < data.length; i++) {
          totCEchg += data[i]?.CE?.changeinOpenInterest;
          totPEchg += data[i]?.PE?.changeinOpenInterest;

          const bankNiftyData = {
            stp: data[i]?.strikePrice,
            PE: {
              OI: data[i]?.PE?.openInterest,
              OIchg: data[i]?.PE?.changeinOpenInterest,
              LTP: data[i]?.PE?.lastPrice,
              V: data[i]?.PE?.totalTradedVolume,
              B: data[i]?.PE?.totalBuyQuantity,
              S: data[i]?.PE?.totalSellQuantity,
            },
            CE: {
              OI: data[i]?.CE?.openInterest,
              OIchg: data[i]?.CE?.changeinOpenInterest,
              LTP: data[i]?.CE?.lastPrice,
              V: data[i]?.CE?.totalTradedVolume,
              B: data[i]?.CE?.totalBuyQuantity,
              S: data[i]?.CE?.totalSellQuantity,
            },
          };
          strikedata.push(bankNiftyData);
        }

        await bankNiftyoption.findOneAndUpdate(
          {
            _id: date,
            datedata: {
              $not: { $elemMatch: { timestamp: response?.records?.timestamp } },
            },
          },
          {
            $addToSet: {
              datedata: {
                timestamp: response?.records?.timestamp,
                indexLTP: data[0]?.PE?.underlyingValue,
                totPEchg: totPEchg,
                totCEchg: totCEchg,
                data: strikedata,
              },
            },
          }
        );
      } catch (error) {
        console.log(error);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
