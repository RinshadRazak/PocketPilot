import { AppState, Transaction, MonthSummary, ChartMonthData, Insight } from '../types';
import {
  getMonthKeyFromDate,
  getCurrentMonthKey,
  getTodayString,
  offsetMonth,
  formatMonthYear,
  formatCurrency,
  toCents,
  fromCents,
} from './formatters';

export function getTransactionsForMonth(state: AppState, monthKey: string): Transaction[] {
  return state.transactions.filter(t => getMonthKeyFromDate(t.date) === monthKey);
}

export function getCategorySpendingForMonth(state: AppState, monthKey: string): Record<string, number> {
  const map: Record<string, number> = {};
  for (const t of getTransactionsForMonth(state, monthKey)) {
    if (t.type === 'expense') {
      map[t.categoryId] = (map[t.categoryId] ?? 0) + toCents(t.amount);
    }
  }
  return Object.fromEntries(
    Object.entries(map).map(([k, v]) => [k, fromCents(v)])
  );
}

export function getMonthSummary(state: AppState, monthKey: string): MonthSummary {
  const txs = getTransactionsForMonth(state, monthKey);
  const incomeCents = txs
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + toCents(t.amount), 0);
  const expenseCents = txs
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + toCents(t.amount), 0);

  const budgetedCategories = state.categories.filter(
    c => c.kind === 'expense' && (state.budgets[c.id] ?? 0) > 0
  );
  const totalBudgetCents = budgetedCategories.reduce(
    (acc, c) => acc + toCents(state.budgets[c.id]),
    0
  );

  const budgetedCatIds = new Set(budgetedCategories.map(c => c.id));
  const budgetedSpentCents = txs
    .filter(t => t.type === 'expense' && budgetedCatIds.has(t.categoryId))
    .reduce((acc, t) => acc + toCents(t.amount), 0);

  return {
    income: fromCents(incomeCents),
    expenses: fromCents(expenseCents),
    balance: fromCents(incomeCents - expenseCents),
    budget: fromCents(totalBudgetCents),
    budgetedSpent: fromCents(budgetedSpentCents),
    remaining: fromCents(totalBudgetCents - budgetedSpentCents),
  };
}

export function getHistoricalChartData(state: AppState, currentMonthKey: string): ChartMonthData[] {
  return Array.from({ length: 6 }, (_, i) => {
    const monthKey = offsetMonth(currentMonthKey, i - 5);
    const summary = getMonthSummary(state, monthKey);
    return {
      month: formatMonthYear(monthKey, 'short'),
      monthKey,
      income: summary.income,
      expenses: summary.expenses,
    };
  });
}

export function generateInsights(state: AppState, monthKey: string): Insight[] {
  const summary = getMonthSummary(state, monthKey);
  const priorMonthKey = offsetMonth(monthKey, -1);
  const isCurrentCalendarMonth = monthKey === getCurrentMonthKey();
  const todayDay = Number(getTodayString().slice(-2));

  const priorTxs = isCurrentCalendarMonth
    ? getTransactionsForMonth(state, priorMonthKey).filter(
        t => Number(t.date.slice(-2)) <= todayDay
      )
    : getTransactionsForMonth(state, priorMonthKey);

  const priorExpense = fromCents(
    priorTxs
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + toCents(t.amount), 0)
  );

  const categorySpending = getCategorySpendingForMonth(state, monthKey);
  const expenseCategories = state.categories.filter(c => c.kind === 'expense');
  const insights: Insight[] = [];

  // Over budget categories
  const overBudgetCats = expenseCategories
    .filter(
      c =>
        toCents(state.budgets[c.id] ?? 0) > 0 &&
        toCents(categorySpending[c.id] ?? 0) > toCents(state.budgets[c.id])
    )
    .sort(
      (a, b) =>
        toCents(categorySpending[b.id] ?? 0) -
        toCents(state.budgets[b.id] ?? 0) -
        (toCents(categorySpending[a.id] ?? 0) - toCents(state.budgets[a.id] ?? 0))
    );

  for (const cat of overBudgetCats.slice(0, 2)) {
    const budget = state.budgets[cat.id];
    const diff = fromCents(
      toCents(categorySpending[cat.id]) - toCents(budget)
    );
    const pct = Math.round((diff / budget) * 100);
    insights.push({
      id: `over-${cat.id}`,
      tone: 'warning',
      title: `${cat.name} is ${pct}% over budget`,
      detail: `That’s ${formatCurrency(diff)} above your ${formatCurrency(budget)} monthly plan.`,
    });
  }

  // Month-over-month comparison
  if (priorExpense > 0 && summary.expenses > 0) {
    const pctDiff = Math.round(
      (Math.abs(summary.expenses - priorExpense) / priorExpense) * 100
    );
    insights.push({
      id: 'month-change',
      tone: summary.expenses <= priorExpense ? 'positive' : 'neutral',
      title: `Spending is ${pctDiff}% ${summary.expenses <= priorExpense ? 'lower' : 'higher'} than last month${isCurrentCalendarMonth ? ' at this point' : ''}`,
      detail: `You’ve spent ${formatCurrency(summary.expenses)} in ${formatMonthYear(monthKey)} versus ${formatCurrency(priorExpense)} in ${formatMonthYear(priorMonthKey)}${isCurrentCalendarMonth ? ` through day ${todayDay}` : ''}.`,
    });
  }

  // Headroom in budget
  const headroomCat = expenseCategories
    .filter(
      c =>
        toCents(categorySpending[c.id] ?? 0) > 0 &&
        toCents(state.budgets[c.id] ?? 0) > toCents(categorySpending[c.id] ?? 0)
    )
    .sort(
      (a, b) =>
        (categorySpending[b.id] ?? 0) - (categorySpending[a.id] ?? 0)
    )[0];

  if (headroomCat) {
    const left = fromCents(
      toCents(state.budgets[headroomCat.id]) - toCents(categorySpending[headroomCat.id])
    );
    const usedPct = Math.round(
      (categorySpending[headroomCat.id] / state.budgets[headroomCat.id]) * 100
    );
    insights.push({
      id: 'room',
      tone: 'positive',
      title: `${headroomCat.name} has ${formatCurrency(left)} left`,
      detail: `You’ve used ${usedPct}% of this category’s monthly budget.`,
    });
  }

  // Savings rate
  if (summary.income > 0) {
    const remainingPct = Math.round((summary.balance / summary.income) * 100);
    insights.push({
      id: 'savings',
      tone: summary.balance >= 0 ? 'positive' : 'warning',
      title: `${remainingPct}% of income remains`,
      detail: `${formatCurrency(summary.balance)} after ${formatCurrency(summary.expenses)} in expenses this month.`,
    });
  }

  if (!insights.length) {
    insights.push({
      id: 'empty',
      tone: 'neutral',
      title: 'Your next insight is one transaction away',
      detail: 'Add income or an expense to start seeing patterns here.',
    });
  }

  return insights;
}
