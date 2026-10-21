export const toCents = (e: number): number => Math.round(e * 100);
export const fromCents = (e: number): number => e / 100;

export const formatCurrency = (amount: number, fractionDigits = 0): string => {
  const cents = toCents(amount);
  const normalized = cents === 0 ? 0 : fromCents(cents);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(normalized);
};

export const formatCurrencyFlexible = (amount: number): string => {
  const cents = toCents(amount);
  return formatCurrency(amount, cents % 100 === 0 ? 0 : 2);
};

export const getTodayString = (): string => {
  const e = new Date();
  return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, '0')}-${String(e.getDate()).padStart(2, '0')}`;
};

export const getCurrentMonthKey = (): string => getTodayString().slice(0, 7);

export const getMonthKeyFromDate = (date: string): string => date.slice(0, 7);

export const offsetMonth = (monthKey: string, offset: number): string => {
  const [year, month] = monthKey.split('-').map(Number);
  const targetDate = new Date(year, month - 1 + offset, 1);
  return `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
};

export const formatMonthYear = (monthKey: string, format: 'long' | 'short' = 'long'): string => {
  const [year, month] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    month: format,
    year: format === 'long' ? 'numeric' : undefined,
  }).format(new Date(year, month - 1, 1));
};

export const formatDateDisplay = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const isValidDateString = (str: string): boolean => {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
};
