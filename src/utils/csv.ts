import { AppState, Category, Transaction, Budgets, ParsedCsvData } from '../types';
import { CATEGORY_COLORS } from './constants';
import { isValidDateString, generateId } from './formatters';

const MAX_CSV_ROWS = 20000;
const MAX_ERRORS = 100;

const sanitizeFormula = (e: string): string =>
  /^'[=+\-@\t]/.test(e) ? e.slice(1) : e;

const escapeCsvField = (e: string): string => {
  const t = /^[=+\-@\t]/.test(e) ? `'${e}` : e;
  return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

export function exportToCsv(state: AppState): string {
  const rows: string[] = [
    [
      'record_type',
      'id',
      'date',
      'type',
      'category',
      'category_id',
      'description',
      'amount',
      'budget',
      'color',
    ].join(','),
  ];

  // Categories
  for (const c of state.categories) {
    rows.push(
      [
        'category',
        c.id,
        '',
        c.kind,
        c.name,
        '',
        '',
        '',
        c.kind === 'expense' ? String(state.budgets[c.id] ?? 0) : '',
        c.color,
      ]
        .map(escapeCsvField)
        .join(',')
    );
  }

  // Transactions sorted by date descending
  const sortedTxs = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date));
  for (const t of sortedTxs) {
    const cat = state.categories.find(c => c.id === t.categoryId);
    rows.push(
      [
        'transaction',
        t.id,
        t.date,
        t.type,
        cat?.name ?? 'Uncategorized',
        t.categoryId,
        t.description,
        t.amount.toFixed(2),
        '',
        '',
      ]
        .map(escapeCsvField)
        .join(',')
    );
  }

  return '\uFEFF' + rows.join('\r\n') + '\r\n';
}

function parseCsvTokens(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  const pushField = () => {
    currentRow.push(currentField);
    if (currentRow.some(s => s.trim())) {
      rows.push(currentRow);
      if (rows.length > MAX_CSV_ROWS + 1) {
        throw new Error(`This file has too many rows. Import up to ${MAX_CSV_ROWS.toLocaleString()} records at a time.`);
      }
    }
    currentRow = [];
    currentField = '';
  };

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (insideQuotes) {
      if (char === '"' && content[i + 1] === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"' && !currentField) {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && content[i + 1] === '\n') {
          i++;
        }
        pushField();
      } else {
        currentField += char;
      }
    }
  }

  if (insideQuotes) {
    throw new Error('A quoted field was not closed. Check the CSV file and try again.');
  }

  pushField();
  return rows;
}

const parseAmount = (val: string): number => {
  const clean = val.replace(/[₹$,]/g, '').trim();
  return clean && /^\d+(?:\.\d{1,2})?$/.test(clean) ? Number(clean) : NaN;
};

export function parseCsv(rawContent: string): ParsedCsvData {
  const rawRows = parseCsvTokens(rawContent.replace(/^\uFEFF/, ''));
  if (!rawRows.length) {
    throw new Error('This file is empty. Choose a CSV with transaction or category rows.');
  }

  const header = rawRows[0].map(h => h.trim().toLowerCase());
  const required = ['date', 'type', 'category', 'description', 'amount'].filter(h => !header.includes(h));
  if (required.length) {
    throw new Error(`Missing columns: ${required.join(', ')}. Use a PocketPilot export or include date, type, category, description, amount.`);
  }

  if (new Set(header).size !== header.length) {
    throw new Error('Column names must be unique.');
  }

  const transactions: ParsedCsvData['transactions'] = [];
  const categories: ParsedCsvData['categories'] = [];
  const errors: ParsedCsvData['errors'] = [];
  let errorCount = 0;

  const logError = (rowNum: number, message: string) => {
    errorCount++;
    if (errors.length < MAX_ERRORS) {
      errors.push({ row: rowNum, message });
    }
  };

  rawRows.slice(1).forEach((row, idx) => {
    const rowNum = idx + 2;
    if (row.length !== header.length) {
      logError(rowNum, `Expected ${header.length} columns, found ${row.length}.`);
      return;
    }

    const rowObj: Record<string, string> = Object.fromEntries(
      header.map((col, i) => [col, row[i].trim()])
    );

    const recordType = (rowObj.record_type || 'transaction').toLowerCase();
    const type = rowObj.type.toLowerCase();
    const categoryName = sanitizeFormula(rowObj.category);

    if (!categoryName || categoryName.length > 60) {
      logError(rowNum, 'Category must be 1–60 characters.');
      return;
    }
    if (type !== 'income' && type !== 'expense') {
      logError(rowNum, 'Type must be income or expense.');
      return;
    }

    if (recordType === 'category') {
      const budgetVal = rowObj.budget || '';
      const parsedBudget = budgetVal ? parseAmount(budgetVal) : undefined;
      if (parsedBudget !== undefined && (!Number.isFinite(parsedBudget) || parsedBudget < 0 || parsedBudget > 1e8)) {
        logError(rowNum, 'Budget must be between zero and 100,000,000.');
        return;
      }
      const color = /^#[0-9a-f]{6}$/i.test(rowObj.color || '') ? rowObj.color : undefined;
      categories.push({
        id: rowObj.id || undefined,
        name: categoryName,
        kind: type as 'income' | 'expense',
        budget: parsedBudget,
        color,
      });
      return;
    }

    if (recordType !== 'transaction') {
      logError(rowNum, 'Record type must be transaction or category.');
      return;
    }

    if (!isValidDateString(rowObj.date)) {
      logError(rowNum, 'Date must be a real YYYY-MM-DD date.');
      return;
    }

    const desc = sanitizeFormula(rowObj.description || '');
    if (desc.length > 120) {
      logError(rowNum, 'Description must be up to 120 characters.');
      return;
    }

    const amt = parseAmount(rowObj.amount);
    if (!Number.isFinite(amt) || amt <= 0 || amt > 1e8) {
      logError(rowNum, 'Amount must be greater than zero and at most 100,000,000.');
      return;
    }

    transactions.push({
      id: rowObj.id || generateId(),
      date: rowObj.date,
      type: type as 'income' | 'expense',
      category: categoryName,
      categoryId: rowObj.category_id || undefined,
      description: desc,
      amount: amt,
    });
  });

  return {
    transactions,
    categories,
    errors,
    errorCount,
    totalRows: rawRows.length - 1,
  };
}

export function mergeCsvRecords(currentState: AppState, parsed: ParsedCsvData): {
  state: AppState;
  added: number;
  skipped: number;
  newCategories: number;
} {
  const categories = currentState.categories.map(c => ({ ...c }));
  const budgets = { ...currentState.budgets };
  const transactions = [...currentState.transactions];
  const txIdSet = new Set(transactions.map(t => t.id));

  let added = 0;
  let skipped = 0;
  let newCategories = 0;

  const findOrCreateCategory = (
    name: string,
    kind: 'income' | 'expense',
    preferredId?: string,
    color?: string,
    updateAttrs = false
  ): Category => {
    let cat: Category | undefined;
    if (preferredId) {
      cat = categories.find(c => c.id === preferredId && c.kind === kind);
    }
    if (!cat) {
      cat = categories.find(c => c.kind === kind && c.name.toLowerCase() === name.toLowerCase());
    }

    if (cat && updateAttrs) {
      if (!categories.some(c => c.id !== cat!.id && c.kind === kind && c.name.toLowerCase() === name.toLowerCase())) {
        cat.name = name;
      }
      if (color) {
        cat.color = color;
      }
    }

    if (!cat) {
      cat = {
        id: preferredId && !categories.some(c => c.id === preferredId) ? preferredId : generateId(),
        name,
        kind,
        color: color ?? CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
      };
      categories.push(cat);
      newCategories++;
    }
    return cat;
  };

  for (const c of parsed.categories) {
    const cat = findOrCreateCategory(c.name, c.kind, c.id, c.color, true);
    if (c.kind === 'expense' && c.budget !== undefined) {
      budgets[cat.id] = c.budget;
    }
  }

  for (const t of parsed.transactions) {
    if (txIdSet.has(t.id)) {
      skipped++;
      continue;
    }
    const cat = findOrCreateCategory(t.category, t.type, t.categoryId);
    transactions.push({
      id: t.id,
      date: t.date,
      type: t.type,
      categoryId: cat.id,
      description: t.description,
      amount: t.amount,
    });
    txIdSet.add(t.id);
    added++;
  }

  return {
    state: {
      version: 1,
      categories,
      budgets,
      transactions,
    },
    added,
    skipped,
    newCategories,
  };
}

export function replaceWithCsvRecords(parsed: ParsedCsvData): {
  state: AppState;
  added: number;
  skipped: number;
  newCategories: number;
} {
  if (parsed.errorCount > 0) {
    throw new Error('Fix the invalid rows before replacing current records.');
  }
  return mergeCsvRecords(
    { version: 1, categories: [], budgets: {}, transactions: [] },
    parsed
  );
}
