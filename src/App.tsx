import { useState } from "react";
import "./App.css";
import type { Account } from "./types";
import useLocalStorageData from "./utils/useLocalStorageData";
import AccountTransactionComponent from "./component/accountTransactionComponent";
import AccountSummaryComponent from "./component/accountSummaryComponent";

function App() {
  const [accountsJson, setAccounts] = useLocalStorageData();
  const [selectedAccountId, setSelectedAccountId] = useState<
    number | undefined
  >(undefined);

  const accounts = JSON.parse(accountsJson) as Account[];
  const selectedAccount = accounts.find((c) => c.id === selectedAccountId);

  return (
    <div className="min-h-svh bg-gray-100 p-8 font-sans flex justify-center">
      <div className="flex max-w-lg w-full">
        {!selectedAccount ? (
            <AccountSummaryComponent
                accounts={accounts}
                setSelectedAccountId={setSelectedAccountId}
                setAccounts={setAccounts}
            />
        ) : (
          <AccountTransactionComponent
            account={selectedAccount}
            accounts={accounts}
            setSelectedAccountId={setSelectedAccountId}
            setAccounts={setAccounts}
          />
        )}
      </div>
    </div>
  );
}

export default App;
