import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { AppState, Category } from '../types';
import { getMonthSummary, getCategorySpendingForMonth } from '../utils/calculations';
import { formatCurrency, formatCurrencyFlexible, toCents } from '../utils/formatters';
import { CategoryMark } from '../components/CategoryMark';

interface BudgetsViewProps {
  state: AppState;
  selectedMonth: string;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onEditBudget: (category: Category) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  state,
  selectedMonth,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onEditBudget,
}) => {
  const summary = getMonthSummary(state, selectedMonth);
  const spendingMap = getCategorySpendingForMonth(state, selectedMonth);

  const expenseCategories = state.categories.filter(c => c.kind === 'expense');
  const incomeCategories = state.categories.filter(c => c.kind === 'income');

  const overLimitCount = expenseCategories.filter(
    c =>
      toCents(state.budgets[c.id] ?? 0) > 0 &&
      toCents(spendingMap[c.id] ?? 0) > toCents(state.budgets[c.id])
  ).length;

  return (
    <div className="view-content">
      <div className="content-toolbar">
        <div className="toolbar-title">
          <span className="eyebrow">YOUR MONTHLY PLAN</span>
          <h2>Category budgets</h2>
          <p>
            These limits repeat each month. Spending updates as you add transactions.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={onAddCategory}
          type="button"
        >
          <Plus size={17} /> New category
        </button>
      </div>

      <div className="budget-summary">
        <div>
          <span>TOTAL PLANNED</span>
          <strong>{formatCurrency(summary.budget)}</strong>
        </div>
        <div>
          <span>SPENT THIS MONTH</span>
          <strong>{formatCurrency(summary.expenses)}</strong>
        </div>
        <div>
          <span>AVAILABLE</span>
          <strong className={summary.remaining < 0 ? 'negative' : ''}>
            {formatCurrency(summary.remaining)}
          </strong>
        </div>
        <div>
          <span>OVER LIMIT</span>
          <strong className={overLimitCount ? 'negative' : ''}>
            {overLimitCount} {overLimitCount === 1 ? 'category' : 'categories'}
          </strong>
        </div>
      </div>

      <section className="panel budget-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">EXPENSE CATEGORIES</span>
            <h2>Your spending limits</h2>
          </div>
          <span className="muted small">{expenseCategories.length} categories</span>
        </div>

        <div className="budget-list">
          {expenseCategories.map(cat => {
            const budget = state.budgets[cat.id] ?? 0;
            const spent = spendingMap[cat.id] ?? 0;
            const percentUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;
            const isOver = toCents(budget) > 0 && toCents(spent) > toCents(budget);

            return (
              <div className="budget-row" key={cat.id}>
                <CategoryMark category={cat} size={20} />

                <div className="budget-info">
                  <div className="budget-heading">
                    <strong>{cat.name}</strong>
                    <span>
                      {budget
                        ? `${formatCurrencyFlexible(spent)} of ${formatCurrencyFlexible(budget)}`
                        : `${formatCurrencyFlexible(spent)} spent · No limit`}
                    </span>
                  </div>

                  <div className="progress-track">
                    <span
                      className={isOver ? 'over' : ''}
                      style={{
                        width: `${Math.min(percentUsed, 100)}%`,
                        background: isOver ? undefined : cat.color,
                      }}
                    />
                  </div>

                  <div className={`budget-status ${isOver ? 'over' : ''}`}>
                    {budget
                      ? isOver
                        ? `${formatCurrencyFlexible(spent - budget)} over budget`
                        : `${formatCurrencyFlexible(budget - spent)} left · ${percentUsed}% used`
                      : 'Set a monthly limit to track this category'}
                  </div>
                </div>

                <div className="budget-actions">
                  <button
                    className="button button-outline budget-edit"
                    onClick={() => onEditBudget(cat)}
                    type="button"
                  >
                    Edit limit
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Edit ${cat.name} category`}
                    onClick={() => onEditCategory(cat)}
                    type="button"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Remove ${cat.name} category`}
                    onClick={() => onDeleteCategory(cat)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel income-categories">
        <div className="panel-head">
          <div>
            <span className="eyebrow">MONEY IN</span>
            <h2>Income categories</h2>
          </div>
        </div>

        <div className="income-category-list">
          {incomeCategories.map(cat => (
            <div className="income-category" key={cat.id}>
              <CategoryMark category={cat} />
              <span>{cat.name}</span>
              <button
                className="icon-button"
                onClick={() => onEditCategory(cat)}
                aria-label={`Edit ${cat.name} category`}
                type="button"
              >
                <Pencil size={16} />
              </button>
              <button
                className="icon-button"
                onClick={() => onDeleteCategory(cat)}
                aria-label={`Remove ${cat.name} category`}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
