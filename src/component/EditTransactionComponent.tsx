import React, { useState } from "react";
import type { Account, Transaction } from "../types";
import Big from "big.js";
import { FiSave, FiTrash2 } from "react-icons/fi";

interface EditTransactionProps {
  t: Transaction;
  account: Account;
  setEditingId: React.Dispatch<React.SetStateAction<number>>;
  onUpdate: (updatedAccount: Account) => void;
}

const EditTransactionComponent: React.FC<EditTransactionProps> = ({
  account,
  t,
  onUpdate,
  setEditingId,
}) => {
  const [editAmount, setEditAmount] = useState(t.amount.toString());
  const [editDesc, setEditDesc] = useState(t.desc);

  const handleSaveEdit = (id: number, editDesc: string, editAmount: string) => {
    let oldBalance = 0;
    const updatedTransactions = account.transactions.map((t) => {
      if (t.id === id) {
        oldBalance = t.amount;
        return {
          id: t.id,
          date: t.date,
          desc: editDesc,
          amount: new Big(editAmount).toNumber(),
        };
      }
      return t;
    });

    const newBalance = new Big(account.balance)
      .minus(new Big(oldBalance))
      .add(editAmount)
      .toNumber();

    onUpdate({
      ...account,
      balance: newBalance,
      transactions: updatedTransactions,
    });
  };

  return (
    <>
      <input
        className="w-24 p-1 border rounded-md"
        type="text"
        value={editDesc}
        onChange={(e) => {
          setEditDesc(e.target.value);
        }}
      ></input>

      <div className="flex items-center gap-5">
        <input
          type="number"
          className="w-24 p-1 border rounded-md"
          value={editAmount}
          onChange={(e) => {
            setEditAmount(e.target.value);
          }}
        />

        {/* Discard edit */}
        <button
          onClick={() => {
            setEditingId(-1);
          }}
          className="text-gray-300 hover:text-red-600 transition"
          title="Discard"
        >
          <FiTrash2 />
        </button>

        {/* Save edit */}
        <button
          onClick={() => {
            handleSaveEdit(t.id, editDesc, editAmount);
            setEditingId(-1);
          }}
          className="text-gray-300 hover:text-blue-600 transition"
          title="Save"
        >
          <FiSave />
        </button>
      </div>
    </>
  );
};

export default EditTransactionComponent;