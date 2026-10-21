export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  kind: TransactionType;
  color: string;
  budget?: number;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  categoryId: string;
  description: string;
  amount: number;
}

export interface Budgets {
  [categoryId: string]: number;
}

export interface AppState {
  version: 1;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budgets;
}

export interface MonthSummary {
  income: number;
  expenses: number;
  balance: number;
  budget: number;
  budgetedSpent: number;
  remaining: number;
}

export interface ChartMonthData {
  month: string;
  monthKey: string;
  income: number;
  expenses: number;
}

export interface Insight {
  id: string;
  tone: 'warning' | 'positive' | 'neutral';
  title: string;
  detail: string;
}

export type ViewType = 'overview' | 'transactions' | 'budgets' | 'insights' | 'data';

export interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel: string;
  dangerous?: boolean;
  action: () => void;
}

export interface ParsedCsvData {
  transactions: Array<{
    id: string;
    date: string;
    type: TransactionType;
    category: string;
    categoryId?: string;
    description: string;
    amount: number;
  }>;
  categories: Array<{
    id?: string;
    name: string;
    kind: TransactionType;
    budget?: number;
    color?: string;
  }>;
  errors: Array<{
    row: number;
    message: string;
  }>;
  errorCount: number;
  totalRows: number;
}
