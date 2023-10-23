import { getNiftyData } from "../ApiResponse/nifty.js";
import { getbankNiftyData } from "../ApiResponse/banknifty.js";
import { getLivePrice } from "../ApiResponse/livePrice.js";
import { getStocks } from "../ApiResponse/stocks.js";


export default function fetchNSE() {
  //fetching data from nse
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
}
