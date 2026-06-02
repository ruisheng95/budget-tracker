import type { Account, Transaction } from "../types";
import dayjs from "dayjs";
import Big from "big.js";

const TODAY = dayjs().toISOString().substring(0, 10);

interface AddTransactionProps {
  desc: string;
  amount: string;
  date: string;

  setDesc: React.Dispatch<React.SetStateAction<string>>;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  setDate: React.Dispatch<React.SetStateAction<string>>;

  account: Account;
  onUpdate: (value: Account) => void;
  oneYearAgoDayJs: dayjs.Dayjs;
  oneYearAgoTransactions: Transaction[];
}

const AddTransactionComponent: React.FC<AddTransactionProps> = ({
  desc,
  amount,
  date,
  setDesc,
  setAmount,
  setDate,
  account,
  onUpdate,
  oneYearAgoDayJs,
  oneYearAgoTransactions,
}) => {
  const handleAdd = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!desc || !amount || !date || new Big(amount).eq(Big(0))) return;

    const amountNum = new Big(amount).round(2).toNumber();
    const newId = account.transactions.reduce(
      (max, item) => (item.id > max ? item.id : max),
      -1
    );

    const newTransaction: Transaction = {
      id: newId + 1,
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

  return (
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
            {[...new Set(oneYearAgoTransactions.map((item) => item.desc))].map(
              (desc, idx) => (
                <option key={idx} value={desc}></option>
              )
            )}
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
  );
};

export default AddTransactionComponent;
