export default function orderName(orderDetails) {
  const name =
    orderDetails.symbol === "NIFTY" || orderDetails.symbol === "BANKNIFTY"
      ? orderDetails.symbol +
        " " +
        orderDetails?.stp +
        " " +
        orderDetails?.optionType +
        " " +
        (orderDetails.orderType === "optionBuying"
          ? "Option Buying"
          : "Option Selling")
      : orderDetails.symbol;

      return name;
}
