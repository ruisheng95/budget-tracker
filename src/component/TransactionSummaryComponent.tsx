import type { Transaction } from "../types";
import dayjs from "dayjs";
import Big from "big.js";

interface TransactionSummary {
  fullSum: number;
  weekendSum: number;
}

interface TransactionSummaryHeaderProps {
  oneYearAgoTransactions: Transaction[];
  t: Transaction;
}

const TransactionSummaryHeader: React.FC<TransactionSummaryHeaderProps> = ({
  oneYearAgoTransactions,
  t,
}) => {
  // Careful this recalculates the whole transaction summary for every different month transaction, if get
  // too slow can move to parent component
  const transactionSummary = oneYearAgoTransactions.reduce<
    Record<string, TransactionSummary>
  >((acc, t) => {
    const key = dayjs(t.date, "YYYY-MM-DD").format("YYYY-MM");
    let value = acc[key];
    if (!value) {
      value = { fullSum: 0, weekendSum: 0 };
      acc[key] = value;
    }
    if (t.amount < 0) {
      value.fullSum = new Big(value.fullSum)
        .add(new Big(t.amount).abs())
        .toNumber();
      const dateDayjs = dayjs(t.date, "YYYY-MM-DD");
      if (dateDayjs.day() == 0 || dateDayjs.day() == 6) {
        value.weekendSum = new Big(value.weekendSum)
          .add(new Big(t.amount).abs())
          .toNumber();
      }
    }
    return acc;
  }, {});

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontWeight: "bold",
        padding: "10px",
        borderBottom: "2px solid #ddd",
      }}
    >
      <span>{dayjs(t.date, "YYYY-MM-DD").format("YYYY-MM")}</span>
      <span>
        Weekend / Total :{" "}
        {
          transactionSummary[dayjs(t.date, "YYYY-MM-DD").format("YYYY-MM")]
            ?.weekendSum
        }{" "}
        /{" "}
        {
          transactionSummary[dayjs(t.date, "YYYY-MM-DD").format("YYYY-MM")]
            ?.fullSum
        }
      </span>
    </div>
  );
};

export default TransactionSummaryHeader;
