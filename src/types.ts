export interface Transaction {
  id: number;
  desc: string;
  amount: number;
  date: string;
}

export interface Account {
  id: number;
  name: string;
  transactions: Transaction[];
  balance: number;
  limit: number;
}
