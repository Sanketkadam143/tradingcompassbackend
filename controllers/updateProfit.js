import Calculateprofit from "../utils/Calculateprofit.js";

export default function updateProfit(io, database) {
  try {
    setInterval(async () => {
      //reparsing date for setting timezone
      var ist = new Date().toLocaleString(undefined, {
        timeZone: "Asia/Kolkata",
      });
      var date = new Date(ist);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        if (date.getHours() >= 9 && date.getHours() <= 15) {
          const NiftyData = await database
            .collection("nifty options")
            .find({})
            .sort({ _id: -1 })
            .limit(1)
            .toArray()
            .then((docs) => {
              return docs[0].datedata[docs[0].datedata.length - 1].data;
            });

          const BankData = await database
            .collection("bank nifty options")
            .find({})
            .sort({ _id: -1 })
            .limit(1)
            .toArray()
            .then((docs) => {
              return docs[0].datedata[docs[0].datedata.length - 1].data;
            });

          const StockData = await database
            .collection("stocks")
            .find({})
            .sort({ _id: -1 })
            .limit(1)
            .toArray()
            .then((docs) => {
              return docs[0].stockdata;
            });

            const Users = await database
            .collection("users")
            .find({ orderDetails: { $ne: [] }, contest: true })
            .toArray();

          Promise.all([NiftyData, BankData, StockData, Users]).then(
            async (values) => {
              const [NiftyData, BankData, StockData, users] = values;
              let bulkOperations = [];
              let leaderBoard = [];
              users.forEach((user) => {
                const orderBook = user.orderDetails;

                let totalProfit = 0;
                let investedProfit = 0;
                orderBook?.forEach((orderDetails) => {
                  let { profit } = Calculateprofit(
                    orderDetails,
                    NiftyData,
                    BankData,
                    StockData
                  );
                  totalProfit += parseInt(profit);

                  if (orderDetails.sellPrice === undefined) {
                    let { profit } = Calculateprofit(
                      orderDetails,
                      NiftyData,
                      BankData,
                      StockData
                    );
                    investedProfit += parseInt(profit);
                  }
                });

                bulkOperations.push({
                  updateOne: {
                    filter: { _id: user._id },
                    update: {
                      $set: {
                        totalProfit: totalProfit,
                        investedProfit: investedProfit,
                      },
                    },
                  },
                });

                leaderBoard.push({
                  name: user.name,
                  picture: user.picture,
                  margin: user.margin,
                  investedProfit: investedProfit,
                  totalProfit: totalProfit,
                });
              });

              leaderBoard.sort(function(a, b) {
                return b.totalProfit - a.totalProfit;
              });
              let top20 = leaderBoard.slice(0, 20);
              io.emit("leaderboard", top20);
              bulkOperations.length > 0 &&
                (await database.collection("users").bulkWrite(bulkOperations));
            }
          );
        }
      }
    }, 120000);
  } catch (error) {
    console.log(error);
  }
}
