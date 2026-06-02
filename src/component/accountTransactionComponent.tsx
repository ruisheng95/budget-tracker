// import React, { useState } from "react";
import "../App.css";
import type { Account } from "../types";
import AccountDetails from "../AccountDetails";
import { getAmountTextColor } from "../utils/common";

interface Props {
  account: Account;
  accounts: Account[];
  setSelectedAccountId: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  setAccounts: (value: Account[]) => void;
}

const AccountTransactionComponent: React.FC<Props> = ({
  account,
  accounts,
  setSelectedAccountId,
  setAccounts,
}) => {
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
