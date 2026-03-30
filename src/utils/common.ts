export const getAmountTextColor = (amt: number) =>
  amt < 0 ? "text-red-600" : amt > 0 ? "text-green-700" : "text-black";
