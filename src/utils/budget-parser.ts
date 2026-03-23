import type { Account } from "../types";
import dayjs from "dayjs";
import Big from "big.js";
import Papa from "papaparse";

const DEFAULT_LIMIT = 10000;

export const exportToBudgetCsv = (accounts: Account[]) => {
  const data = accounts.flatMap((account) =>
    // Budget CSV format
    account.transactions.map((transaction) => ({
      date: dayjs(transaction.date, "YYYY-MM-DD").valueOf(),
      account: account.name,
      amount: new Big(transaction.amount).mul(new Big(100)).toNumber(),
      note: transaction.desc,
      // category: "",
    }))
  );

  const csv = Papa.unparse(data, {
    quotes: true,
    header: false,
    delimiter: ",",
  });

  // 2. Create a Blob and a URL for the file
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // 3. Create a temporary link and click it
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "my_data.csv");
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromBudgetCSV = (
  e: React.ChangeEvent<HTMLInputElement>
): Promise<Account[]> => {
  return new Promise((resolve, reject) => {
    const file = e.target.files?.[0];
    if (!file) {
      reject(new Error("Not a file."));
      return;
    }

    Papa.parse<[string, string, string, string]>(file, {
      skipEmptyLines: true,
      complete: (results) => {
        const newAccounts: Record<string, Account> = {};
        let accountCount = 0;
        let transactionCount = 0;
        results.data.forEach((csvData) => {
          const date = dayjs(Number(csvData[0])).format("YYYY-MM-DD");
          const accountName = csvData[1];
          const amount = new Big(csvData[2]).div(new Big(100)).toNumber();
          const transactionDescription = csvData[3];

          let account = newAccounts[accountName];
          if (!account) {
            account = {
              id: accountCount,
              name: accountName,
              transactions: [],
              balance: 0,
              limit: DEFAULT_LIMIT,
            };
            accountCount++;
            newAccounts[accountName] = account;
          }

          account.transactions.push({
            id: transactionCount,
            desc: transactionDescription,
            amount: amount,
            date: date,
          });
          account.balance = new Big(account.balance)
            .add(new Big(amount))
            .toNumber();
          transactionCount++;
        });
        Object.values(newAccounts).forEach((account) => {
          account.transactions.sort((a, b) => b.date.localeCompare(a.date));
        });
        resolve(Object.values(newAccounts));
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
