import React, { useState } from "react";
import type { Account, Transaction } from "./types";
import dayjs from "dayjs";
import Big from "big.js";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getAmountTextColor } from "./utils/common";
dayjs.extend(customParseFormat);

interface Props {
  account: Account;
  onUpdate: (updatedAccount: Account) => void;
}

interface TransactionSummary {
  fullSum: number;
  weekendSum: number;
}

const TODAY = dayjs().toISOString().substring(0, 10);

const AccountDetails: React.FC<Props> = ({ account, onUpdate }) => {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("-0");
  const [date, setDate] = useState(TODAY);

  const handleAdd = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!desc || !amount || !date || new Big(amount).eq(Big(0))) return;

    const amountNum = new Big(amount).round(2).toNumber();

    const newTransaction: Transaction = {
      id: account.transactions.length,
      desc: desc,
      amount: amountNum,
      date: date,
    };

    onUpdate({
      ...account,
      balance: new Big(account.balance).add(new Big(amountNum)).toNumber(),
      transactions: [newTransaction, ...account.transactions].sort((a, b) =>
        b.date.localeCompare(a.date)
      ),
    });

    setDesc("");
    setAmount("-0");
  };

  const handleDelete = (id: number) => {
    const removedTransaction = account.transactions.find((t) => t.id === id);
    const newBalance = new Big(account.balance)
      .minus(new Big(removedTransaction?.amount ?? 0))
      .toNumber();
    onUpdate({
      ...account,
      balance: newBalance,
      transactions: account.transactions.filter((t) => t.id !== id),
    });
  };

  const oneYearAgoDayJs = dayjs(
    account.transactions[0]?.date ?? dayjs(),
    "YYYY-MM-DD"
  ).subtract(1, "year");

  const oneYearAgoTransactions = account.transactions.filter((t) =>
    dayjs(t.date, "YYYY-MM-DD").isAfter(oneYearAgoDayJs)
  );

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
    <div className="w-full">
      <div className="bg-white py-6 px-2 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              list="desc"
              type="text"
              placeholder="Description (e.g. Starbucks)"
              className="flex-1 p-2 border rounded-md"
              required
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
              }}
            />
            <datalist id="desc">
              {[
                ...new Set(oneYearAgoTransactions.map((item) => item.desc)),
              ].map((desc, idx) => (
                <option key={idx} value={desc}></option>
              ))}
            </datalist>
            <input
              type="number"
              placeholder="Amount"
              className="w-full md:w-32 p-2 border rounded-md"
              required
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Add
            </button>
          </div>
          <input
            type="date"
            placeholder="Date"
            className="w-full md:w-40 p-2 border rounded-md"
            value={date}
            required
            min={oneYearAgoDayJs.toISOString().substring(0, 10)}
            max={TODAY}
            onChange={(e) => {
              setDate(e.target.value);
            }}
          />
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">Recent Transactions</h3>
        {account.transactions.length === 0 && (
          <p className="text-gray-400">No transactions yet.</p>
        )}
        {oneYearAgoTransactions.map((t, idx, arr) => (
          <React.Fragment key={t.id}>
            {(idx === 0 ||
              dayjs(t.date, "YYYY-MM-DD").month() !==
                dayjs(arr[idx - 1]?.date, "YYYY-MM-DD").month()) && (
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
                    transactionSummary[
                      dayjs(t.date, "YYYY-MM-DD").format("YYYY-MM")
                    ]?.weekendSum
                  }{" "}
                  /{" "}
                  {
                    transactionSummary[
                      dayjs(t.date, "YYYY-MM-DD").format("YYYY-MM")
                    ]?.fullSum
                  }
                </span>
              </div>
            )}
            <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
              <div>
                <p className="font-medium">{t.desc}</p>
                <p className="text-xs text-gray-400">{t.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-mono font-semibold ${getAmountTextColor(t.amount)}`}
                >
                  RM{t.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => {
                    handleDelete(t.id);
                  }}
                  className="text-gray-300 hover:text-red-600 transition"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          </React.Fragment>
        ))}
        <p className="text-gray-400 text-center">
          Only recent 1 year transactions are shown
        </p>
      </div>
    </div>
  );
};

export default AccountDetails;
