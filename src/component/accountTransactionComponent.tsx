import "../App.css";
import React, { useState } from "react";
import dayjs from "dayjs";

import type { Account } from "../types";
import { getAmountTextColor } from "../utils/common";

import customParseFormat from "dayjs/plugin/customParseFormat";
import DisplayTransactionComponent from "./DisplayTransactionComponent";
import EditTransactionComponent from "./EditTransactionComponent";
import AddTransactionComponent from "./AddTransactionComponent";
import TransactionSummaryHeader from "./TransactionSummaryComponent";

interface AccountTransactionComponentProps {
  account: Account;
  accounts: Account[];
  setSelectedAccountId: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  setAccounts: (value: Account[]) => void;
}

const AccountTransactionComponent: React.FC<
  AccountTransactionComponentProps
> = ({ account, accounts, setSelectedAccountId, setAccounts }) => {
  return (
    <section className="flex flex-col flex-1 items-start">
      <button
        onClick={() => {
          setSelectedAccountId(undefined);
        }}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Back to Dashboard
      </button>
      <h1 className="text-xl font-bold mb-2 w-full flex justify-between">
        <span>{account.name} History</span>
        <span className={getAmountTextColor(account.balance)}>
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
};

export default AccountTransactionComponent;

// From AccountDetails.tsx
dayjs.extend(customParseFormat);

interface AccountDetailsProps {
  account: Account;
  onUpdate: (updatedAccount: Account) => void;
}

const TODAY = dayjs().toISOString().substring(0, 10);

const AccountDetails: React.FC<AccountDetailsProps> = ({
  account,
  onUpdate,
}) => {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("-0");
  const [date, setDate] = useState(TODAY);
  const [editingId, setEditingId] = useState(-1);

  const oneYearAgoDayJs = dayjs(
    account.transactions[0]?.date ?? dayjs(),
    "YYYY-MM-DD"
  ).subtract(1, "year");

  const oneYearAgoTransactions = account.transactions.filter((t) =>
    dayjs(t.date, "YYYY-MM-DD").isAfter(oneYearAgoDayJs)
  );

  return (
    <div className="w-full">
      <AddTransactionComponent
        desc={desc}
        amount={amount}
        date={date}
        setDesc={setDesc}
        setAmount={setAmount}
        setDate={setDate}
        account={account}
        onUpdate={onUpdate}
        oneYearAgoDayJs={oneYearAgoDayJs}
        oneYearAgoTransactions={oneYearAgoTransactions}
      />

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
              <TransactionSummaryHeader
                oneYearAgoTransactions={oneYearAgoTransactions}
                t={t}
              />
            )}

            <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
              {!(editingId === t.id) ? (
                <DisplayTransactionComponent
                  t={t}
                  account={account}
                  setEditingId={setEditingId}
                  onUpdate={onUpdate}
                />
              ) : (
                <EditTransactionComponent
                  t={t}
                  account={account}
                  onUpdate={onUpdate}
                  setEditingId={setEditingId}
                />
              )}
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
