import { AppState, Category, Transaction, Budgets } from '../types';
import {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  BACKUP_KEY,
  LEGACY_BACKUP_KEY,
  DEFAULT_CATEGORIES,
  DEFAULT_BUDGETS,
} from './constants';
import {
  getCurrentMonthKey,
  getTodayString,
  offsetMonth,
  isValidDateString,
  toCents,
  fromCents,
} from './formatters';

const isPlainObject = (e: unknown): e is Record<string, unknown> =>
  e !== null && typeof e === 'object' && !Array.isArray(e);

export function generateSeedData(): AppState {
  const currentMonth = getCurrentMonthKey();
  const currentDay = Number(getTodayString().slice(-2));
  const transactions: Transaction[] = [];
  let seq = 0;

  const addTx = (
    monthOffset: number,
    day: number,
    type: 'income' | 'expense',
    categoryId: string,
    description: string,
    amount: number
  ) => {
    const month = offsetMonth(currentMonth, monthOffset);
    const resolvedDay = monthOffset === 0 ? Math.min(day, currentDay) : day;
    transactions.push({
      id: `opening-${++seq}`,
      date: `${month}-${String(resolvedDay).padStart(2, '0')}`,
      type,
      categoryId,
      description,
      amount,
    });
  };

  // Past 5 months
  for (let c = -5; c < 0; c++) {
    const s = c + 5;
    addTx(c, 1, 'income', 'salary', 'Northline Studio · Payroll', [50800, 51400, 51400, 52200, 52200][s] / 10);
    if (s === 1 || s === 3) {
      addTx(c, 18, 'income', 'freelance', 'Fieldwork · Design project', [0, 620, 0, 780, 0][s]);
    }
    addTx(c, 2, 'expense', 'housing', 'Apartment Rent', 1740);
    addTx(c, 4, 'expense', 'groceries', 'Supermarket Supplies', [176, 195, 228, 186, 202][s]);
    addTx(c, 17, 'expense', 'groceries', 'Organic Store', [214, 189, 203, 226, 211][s]);
    addTx(c, 7, 'expense', 'dining', 'Weekend Dinner', [72, 84, 91, 79, 96][s]);
    addTx(c, 23, 'expense', 'dining', 'Family Restaurant', [118, 126, 134, 108, 122][s]);
    addTx(c, 9, 'expense', 'transport', 'Metro Pass', 132);
    addTx(c, 14, 'expense', 'utilities', 'Electricity Bill', [112, 118, 123, 116, 128][s]);
    addTx(c, 3, 'expense', 'subscriptions', 'Spotify Premium', 119);
    addTx(c, 20, 'expense', 'subscriptions', 'Netflix', 199);
    addTx(c, 11, 'expense', 'shopping', ['Apparel Store', 'Bookshop', 'Department Store', 'Home Décor', 'Electronics'][s], [86, 142, 48, 164, 119][s]);
    addTx(c, 21, 'expense', 'health', 'Clinic Consultation', [35, 35, 45, 35, 35][s]);
    addTx(c, 25, 'expense', 'entertainment', 'Cinema Tickets', [42, 56, 38, 64, 48][s]);
    if (s === 0 || s === 4) {
      addTx(c, 26, 'expense', 'travel', 'Train Travel', s === 0 ? 192 : 156);
    }
  }

  // Current month
  addTx(0, 1, 'income', 'salary', 'Northline Studio · Payroll', 5250);
  addTx(0, 1, 'expense', 'housing', 'Apartment Rent', 1740);
  addTx(0, 2, 'expense', 'dining', 'Weekend Dinner', 96);
  addTx(0, 2, 'expense', 'utilities', 'Electricity Bill', 118.42);
  addTx(0, 3, 'expense', 'groceries', 'Supermarket Supplies', 126.38);
  addTx(0, 3, 'expense', 'transport', 'Transit Pass', 34);
  addTx(0, 3, 'expense', 'subscriptions', 'Spotify Premium', 119);
  addTx(0, 4, 'expense', 'dining', 'Café Coffee', 89);
  addTx(0, 4, 'expense', 'shopping', 'Stationery Store', 85);
  addTx(0, 4, 'expense', 'dining', 'Tea & Snacks', 32);
  addTx(0, 5, 'expense', 'dining', 'Dinner Outing', 113);
  addTx(0, 5, 'expense', 'groceries', 'Fresh Produce Market', 71.64);
  addTx(0, 5, 'expense', 'transport', 'Ride Share', 27.5);
  addTx(0, 5, 'expense', 'health', 'Pharmacy Medicines', 35);
  addTx(0, 5, 'expense', 'entertainment', 'Cinema Tickets', 54);

  return {
    version: 1,
    categories: DEFAULT_CATEGORIES.map(c => ({ ...c })),
    transactions,
    budgets: { ...DEFAULT_BUDGETS },
  };
}

export function validateState(data: unknown): AppState | null {
  try {
    if (!isPlainObject(data) || data.version !== 1 || !Array.isArray(data.categories) || !Array.isArray(data.transactions) || !isPlainObject(data.budgets)) {
      return null;
    }

    const categories: Category[] = [];
    const catIdSet = new Set<string>();
    const catNameSet = new Set<string>();

    for (const h of data.categories) {
      if (
        !isPlainObject(h) ||
        typeof h.id !== 'string' ||
        !h.id ||
        typeof h.name !== 'string' ||
        !h.name.trim() ||
        h.name.length > 60 ||
        (h.kind !== 'income' && h.kind !== 'expense') ||
        typeof h.color !== 'string' ||
        !/^#[0-9a-f]{6}$/i.test(h.color) ||
        catIdSet.has(h.id)
      ) {
        return null;
      }
      const key = `${h.kind}:${h.name.toLowerCase()}`;
      if (catNameSet.has(key)) return null;
      catIdSet.add(h.id);
      catNameSet.add(key);
      categories.push({
        id: h.id,
        name: h.name,
        kind: h.kind as 'income' | 'expense',
        color: h.color,
      });
    }

    const categoryMap = new Map(categories.map(h => [h.id, h]));
    const transactions: Transaction[] = [];
    const txIdSet = new Set<string>();

    for (const h of data.transactions) {
      if (
        !isPlainObject(h) ||
        typeof h.id !== 'string' ||
        !h.id ||
        txIdSet.has(h.id) ||
        typeof h.date !== 'string' ||
        !isValidDateString(h.date) ||
        (h.type !== 'income' && h.type !== 'expense') ||
        typeof h.categoryId !== 'string' ||
        categoryMap.get(h.categoryId)?.kind !== h.type ||
        typeof h.description !== 'string' ||
        h.description.length > 120 ||
        typeof h.amount !== 'number' ||
        !Number.isFinite(h.amount) ||
        h.amount <= 0 ||
        h.amount > 1e8
      ) {
        return null;
      }
      txIdSet.add(h.id);
      transactions.push({
        id: h.id,
        date: h.date,
        type: h.type as 'income' | 'expense',
        categoryId: h.categoryId,
        description: h.description,
        amount: fromCents(toCents(h.amount)),
      });
    }

    const budgets: Budgets = {};
    for (const [catId, amount] of Object.entries(data.budgets)) {
      if (
        !categoryMap.has(catId) ||
        categoryMap.get(catId)?.kind !== 'expense' ||
        typeof amount !== 'number' ||
        !Number.isFinite(amount) ||
        amount < 0 ||
        amount > 1e8
      ) {
        return null;
      }
      budgets[catId] = fromCents(toCents(amount));
    }

    return {
      version: 1,
      categories,
      transactions,
      budgets,
    };
  } catch {
    return null;
  }
}

export function loadInitialState(): AppState {
  try {
    // 1. Check primary PocketPilot storage key
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const valid = validateState(parsed);
      if (valid) return valid;
      try {
        localStorage.setItem(BACKUP_KEY, raw);
      } catch {
        // ignore
      }
    }

    // 2. Check legacy Pocketwise storage key to seamlessly preserve existing user data
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      const valid = validateState(parsed);
      if (valid) {
        // Save migrated state to new key
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
        } catch {
          // ignore
        }
        return valid;
      }
    }
  } catch {
    // ignore
  }
  return generateSeedData();
}

export function saveStateToStorage(state: AppState): boolean {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    // Also mirror to legacy key so no data is ever lost if rolled back
    localStorage.setItem(LEGACY_STORAGE_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}
