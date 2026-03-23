import { useState } from "react";
import "./App.css";
import type { Account } from "./types";
import AccountDetails from "./AccountDetails";
import { exportToBudgetCsv, importFromBudgetCSV } from "./utils/budget-parser";
import Big from "big.js";
import useLocalStorageData from "./utils/useLocalStorageData";

function App() {
  const [accountsJson, setAccounts] = useLocalStorageData();
  const [selectedAccountId, setSelectedAccountId] = useState<
    number | undefined
  >(undefined);

  const accounts = JSON.parse(accountsJson) as Account[];
  const selectedAccount = accounts.find((c) => c.id === selectedAccountId);
  const balanceSum = accounts
    .reduce((sum, account) => sum.add(account.balance), new Big(0))
    .toNumber();

  const accountSummaryComponent = (): React.JSX.Element => (
    <section className="flex flex-col flex-1">
      <div className="flex items-center mb-6 justify-between text-2xl font-bold">
        <h1>My Accounts</h1>
        <h1 className={balanceSum > 0 ? "text-green-700" : "text-red-600"}>
          RM{balanceSum}
        </h1>
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
              className={`text-2xl font-mono ${account.balance > 0 ? "text-green-700" : "text-red-600"} flex justify-between`}
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
      </div>
      <div>&nbsp;</div>
      <div className="flex gap-4 mb-6 mt-auto">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => {
            exportToBudgetCsv(accounts);
          }}
        >
          Export CSV
        </button>

        <label className="bg-gray-200 px-4 py-2 rounded cursor-pointer hover:bg-gray-300">
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
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => {
            setAccounts([]);
            localStorage.clear();
          }}
        >
          Clear All Data
        </button>
      </div>
    </section>
  );

  const accountTransactionComponent = (account: Account): React.JSX.Element => (
    <section className="flex flex-col flex-1 items-start">
      <button
        onClick={() => {
          setSelectedAccountId(undefined);
        }}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold mb-2 w-full flex justify-between">
        <span>{account.name} History</span>
        <span
          className={account.balance > 0 ? "text-green-700" : "text-red-600"}
        >
          RM{account.balance}
        </span>
      </h1>
      <AccountDetails
        account={account}
        onUpdate={(updatedAccount: Account) => {
          setAccounts(
            accounts.map((c) =>
              c.id === updatedAccount.id ? updatedAccount : c
            )
          );
        }}
      />
    </section>
  );

  return (
    <div className="min-h-svh bg-gray-100 p-8 font-sans flex justify-center">
      <div className="flex max-w-lg w-full">
        {!selectedAccount
          ? accountSummaryComponent()
          : accountTransactionComponent(selectedAccount)}
      </div>
    </div>
  );
}

export default App;
