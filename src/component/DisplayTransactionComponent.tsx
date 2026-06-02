import React, { useState } from "react";
import type { Account, Transaction } from "../types";
import Big from "big.js";
import { getAmountTextColor } from "../utils/common";
import { FiEdit } from "react-icons/fi";

interface TransactionRowProps {
  t: Transaction;
  account: Account;
  setEditingId: React.Dispatch<React.SetStateAction<number>>;
  onUpdate: (updatedAccount: Account) => void;
}

const DisplayTransactionComponent: React.FC<TransactionRowProps> = ({
  t,
  account,
  setEditingId,
  onUpdate,
}) => {
  const [deletePromptId, setDeletePromptId] = useState(-1);

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

  return (
    <>
      <div>
        <p className="font-medium">{t.desc}</p>
        <p className="text-xs text-gray-400">{t.date}</p>
      </div>
      <div className="flex items-center gap-5">
        <span
          className={`font-mono font-semibold ${getAmountTextColor(t.amount)}`}
        >
          RM{t.amount.toFixed(2)}
        </span>
        <button
          onClick={() => {
            setEditingId(t.id);
          }}
          className="text-gray-300 hover:text-green-600 transition"
          title="Edit"
        >
          <FiEdit />
        </button>

        <button
          onClick={() => {
            setDeletePromptId(t.id);
          }}
          className="text-gray-300 hover:text-red-600 transition"
          title="Delete"
        >
          X
        </button>

        {/* Delete prompt */}
        {deletePromptId === t.id && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <div
              className="bg-white p-5 rounded-lg shadow-lg w-96"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <h1>Are you sure you want to delete this transaction</h1>
              <div className="flex gap-3 mt-2">
                <button
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    handleDelete(t.id);
                    setDeletePromptId(-1);
                  }}
                >
                  Yes
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    setDeletePromptId(-1);
                  }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Delete prompt end */}
      </div>
    </>
  );
};

export default DisplayTransactionComponent;