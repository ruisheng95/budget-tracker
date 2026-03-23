import React, { Fragment, useState } from "react";
import type { Account, Transaction } from "./types";
import dayjs from "dayjs";
import Big from "big.js";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

interface Props {
  account: Account;
  onUpdate: (updatedAccount: Account) => void;
}

const TODAY = dayjs().toISOString().substring(0, 10);

const AccountDetails: React.FC<Props> = ({ account, onUpdate }) => {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(TODAY);

  const handleAdd = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!desc || !amount || !date) return;

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
      transactions: [newTransaction, ...account.transactions],
    });

    setDesc("");
    setAmount("");
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

  return (
    <div className="w-full">
      <div className="bg-white py-6 px-2 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Description (e.g. Starbucks)"
              className="flex-1 p-2 border rounded-md"
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
              }}
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-full md:w-32 p-2 border rounded-md"
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
        {account.transactions.map((t) =>
          dayjs(t.date, "YYYY-MM-DD").isAfter(oneYearAgoDayJs) ? (
            <div
              key={t.id}
              className="flex justify-between items-center p-4 bg-white rounded-lg border"
            >
              <div>
                <p className="font-medium">{t.desc}</p>
                <p className="text-xs text-gray-400">{t.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-mono font-semibold ${t.amount > 0 ? "text-green-700" : "text-red-600"}`}
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
          ) : (
            <Fragment key={t.id}></Fragment>
          )
        )}
        <p className="text-gray-400 text-center">
          Only recent 1 year transactions are shown
        </p>
      </div>
    </div>
  );
};

export default AccountDetails;
