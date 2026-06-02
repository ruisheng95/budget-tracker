import React, { useState } from "react";
import type { Account } from "../types";
import { exportToBudgetCsv, importFromBudgetCSV } from "../utils/budget-parser";
import Big from "big.js";
import { getAmountTextColor } from "../utils/common";
import { FiSettings, FiPlus } from "react-icons/fi"; //for icons

interface Props {
  accounts: Account[];

  setAccounts: (value: Account[]) => void;
  setSelectedAccountId: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
}

const AccountSummaryComponent: React.FC<Props> = ({
  accounts,
  setSelectedAccountId,
  setAccounts,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const balanceSum = accounts
    .reduce((sum, account) => sum.add(account.balance), new Big(0))
    .toNumber();

  return (
    <section className="flex flex-col flex-1">
      <div className="flex items-center mb-6 justify-between text-2xl font-bold gap-3">
        <h1 className="text-xl">My Accounts</h1>
        <h1 className={`${getAmountTextColor(balanceSum)} text-2xl`}>
          RM{balanceSum}
        </h1>
        <button
          className="bg-gray-300 p-1 rounded hover:bg-gray-400"
          onClick={() => {
            setShowSettings(true);
          }}
        >
          <FiSettings size={24} />
        </button>

        {/* settings popup */}
        {showSettings && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center"
            onClick={() => {
              setShowSettings(false);
            }}
          >
            <div
              className="bg-white p-5 rounded-lg shadow-lg w-96"
              onClick={(e) => {
                e.stopPropagation(); // block click from propagating to the outer div when pressing settings stuff
              }}
            >
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <div className="flex gap-4">
                <button
                  className="text-xl bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={() => {
                    exportToBudgetCsv(accounts);
                  }}
                >
                  Export CSV
                </button>

                <label className="text-center text-xl bg-gray-200 px-4 py-2 rounded cursor-pointer hover:bg-gray-300">
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      importFromBudgetCSV(e)
                        .then((result) => {
                          localStorage.setItem("data", JSON.stringify(result));
                          setAccounts(result);
                        })
                        .catch((e: unknown) => {
                          console.error("Import failed:", e);
                        });
                    }}
                    className="hidden"
                  />
                </label>

                <button
                  className="text-xl bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => {
                    setAccounts([]);
                    localStorage.clear();
                    setShowSettings(false);
                  }}
                >
                  Clear All Data
                </button>
              </div>
              <p className="text-gray-600 text-xs italic mt-4">
                Click anywhere in the background to close
              </p>
            </div>
          </div>
        )}
        {/* End settings popup */}
      </div>
      <div className="grid gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            onClick={() => {
              setSelectedAccountId(account.id);
            }}
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200"
          >
            <h2 className="text-lg font-semibold">{account.name}</h2>
            <p
              className={`text-2xl font-mono ${getAmountTextColor(
                account.balance
              )} flex justify-between`}
            >
              <span>RM{account.balance.toFixed(2)}</span>
              {account.name === "Shopee" && (
                <span className="text-black">
                  /
                  {new Big(account.limit)
                    .minus(new Big(account.balance))
                    .toNumber()}
                </span>
              )}
            </p>
          </div>
        ))}

        {/* Add new acc button */}
        <div
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200"
          onClick={() => {
            setShowAddAccount(true);
          }}
        >
          <FiPlus size={24} className="mx-auto" />
        </div>

        {/* Add new acc popup */}
        {showAddAccount && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center"
            onClick={() => {
              setShowAddAccount(false);
            }}
          >
            <div
              className="bg-white p-5 rounded-lg shadow-lg w-96"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <h2 className="text-2xl font-bold mb-4">Add account</h2>
              <input
                type="text"
                placeholder="Account name"
                className="w-full p-2 border rounded-md mb-4"
                onChange={(e) => {
                  setNewAccountName(e.target.value);
                }}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                onClick={() => {
                  const newAccountDetails: Account = {
                    id: accounts.length + 1,
                    name: newAccountName,
                    transactions: [],
                    balance: 0,
                    limit: 10000,
                  };
                  setAccounts([...accounts, newAccountDetails]);
                  setNewAccountName("");
                  setShowAddAccount(false);
                }}
              >
                Add
              </button>
              <p className="text-gray-600 text-xs italic mt-4">
                Click anywhere in the background to close
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AccountSummaryComponent;
