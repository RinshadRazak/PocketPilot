import { Category, Budgets } from '../types';

export const STORAGE_KEY = 'pocketpilot-v1';
export const LEGACY_STORAGE_KEY = 'pocketwise-v1';
export const BACKUP_KEY = 'pocketpilot-unreadable-backup';
export const LEGACY_BACKUP_KEY = 'pocketwise-unreadable-backup';
export const DEMO_CLEANUP_KEY = 'pocketpilot-cleaned-demo-v1';
export const DEMO_BACKUP_KEY = 'pocketpilot-demo-migration-backup';

export const CATEGORY_COLORS = [
  '#74f6c8',
  '#a49cff',
  '#f2b875',
  '#7bb8ff',
  '#fa8e9d',
  '#85d7d8',
  '#d5b4ef',
  '#b4d67b',
  '#efa989',
  '#a0b7d5',
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'housing', name: 'Housing', kind: 'expense', color: '#a49cff' },
  { id: 'groceries', name: 'Groceries', kind: 'expense', color: '#74f6c8' },
  { id: 'dining', name: 'Dining', kind: 'expense', color: '#f2b875' },
  { id: 'transport', name: 'Transport', kind: 'expense', color: '#7bb8ff' },
  { id: 'shopping', name: 'Shopping', kind: 'expense', color: '#fa8e9d' },
  { id: 'utilities', name: 'Utilities', kind: 'expense', color: '#85d7d8' },
  { id: 'subscriptions', name: 'Subscriptions', kind: 'expense', color: '#d5b4ef' },
  { id: 'health', name: 'Health', kind: 'expense', color: '#b4d67b' },
  { id: 'entertainment', name: 'Entertainment', kind: 'expense', color: '#efa989' },
  { id: 'travel', name: 'Travel', kind: 'expense', color: '#a0b7d5' },
  { id: 'salary', name: 'Salary', kind: 'income', color: '#74f6c8' },
  { id: 'freelance', name: 'Freelance', kind: 'income', color: '#a49cff' },
];

export const DEFAULT_BUDGETS: Budgets = {
  housing: 0,
  groceries: 0,
  dining: 0,
  transport: 0,
  shopping: 0,
  utilities: 0,
  subscriptions: 0,
  health: 0,
  entertainment: 0,
  travel: 0,
};
