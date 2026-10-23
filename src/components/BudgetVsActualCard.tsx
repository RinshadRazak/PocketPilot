import React from 'react';
import { ArrowUpRight, Sliders, AlertTriangle } from 'lucide-react';
import { AppState, ViewType } from '../types';
import { getCategorySpendingForMonth } from '../utils/calculations';
import { formatCurrency, formatMonthYear } from '../utils/formatters';
import { CategoryMark } from './CategoryMark';

interface BudgetVsActualCardProps {
  state: AppState;
  month: string;
  onNavigate: (view: ViewType) => void;
}

export const BudgetVsActualCard: React.FC<BudgetVsActualCardProps> = ({
  state,
  month,
  onNavigate,
}) => {
  const spendingMap = getCategorySpendingForMonth(state, month);

  // Filter only expense categories that have a configured monthly budget > 0
  const budgetedCategories = state.categories
    .filter(c => c.kind === 'expense' && (state.budgets[c.id] ?? 0) > 0)
    .map(c => {
      const budget = state.budgets[c.id] ?? 0;
      const spent = spendingMap[c.id] ?? 0;
      const percentUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;
      const isOver = spent > budget;
      const isApproaching = !isOver && percentUsed >= 80;
      const diff = Math.abs(budget - spent);

      return {
        category: c,
        budget,
        spent,
        percentUsed,
        isOver,
        isApproaching,
        diff,
      };
    })
    // Sort: categories over budget first, then by percentUsed descending
    .sort((a, b) => {
      if (a.isOver !== b.isOver) return a.isOver ? -1 : 1;
      return b.percentUsed - a.percentUsed;
    });

  const hasBudgets = budgetedCategories.length > 0;
  const overLimitCount = budgetedCategories.filter(b => b.isOver).length;

  return (
    <section className="panel category-analytics-panel budget-vs-actual-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">MONTHLY TARGETS</span>
          <h2>Budget vs actual</h2>
          <p>
            {overLimitCount > 0
              ? `${overLimitCount} ${overLimitCount === 1 ? 'limit' : 'limits'} exceeded in ${formatMonthYear(month, 'short')}`
              : `Tracking ${budgetedCategories.length} category ${budgetedCategories.length === 1 ? 'limit' : 'limits'}`}
          </p>
        </div>
        <button
          className="text-link"
          onClick={() => onNavigate('budgets')}
          type="button"
          aria-label="View and manage all category budgets"
        >
          Manage limits <ArrowUpRight size={14} />
        </button>
      </div>

      {!hasBudgets ? (
        <div className="empty-state compact-empty" style={{ minHeight: '230px', padding: '24px 16px' }}>
          <div className="empty-icon-box blue-glow">
            <Sliders size={26} style={{ color: '#80baff' }} />
          </div>
          <h3 style={{ fontSize: '15px', margin: '10px 0 3px', color: '#e3edf7' }}>No category budgets set</h3>
          <p style={{ fontSize: '11px', margin: '0 0 14px', color: 'var(--muted)', maxWidth: '290px', lineHeight: 1.5 }}>
            Configure monthly limits in Budgets to track your actual spending against targets.
          </p>
          <button
            className="button button-outline"
            onClick={() => onNavigate('budgets')}
            type="button"
            style={{ minHeight: '30px', padding: '0 12px', fontSize: '11px' }}
          >
            Configure budgets
          </button>
        </div>
      ) : (
        <div className="budget-actual-content">
          <div className="budget-actual-list" role="list" aria-label="Budget versus actual spending">
            {budgetedCategories.map((item) => {
              const { category, budget, spent, percentUsed, isOver, isApproaching, diff } = item;

              // Color rules:
              // - Budget exceeded (> 100%): red/danger
              // - Approaching budget (80% - 100%): warning amber
              // - Normal (< 80%): primary mint
              let statusClass = 'status-normal';
              let statusColor = 'var(--mint)';
              let statusText = `${formatCurrency(diff)} remaining`;

              if (isOver) {
                statusClass = 'status-over';
                statusColor = '#f1929a';
                statusText = `${formatCurrency(diff)} over limit`;
              } else if (isApproaching) {
                statusClass = 'status-warn';
                statusColor = '#f2b875';
                statusText = `${formatCurrency(diff)} left · Approaching limit`;
              }

              return (
                <div className={`budget-actual-row ${statusClass}`} key={category.id} role="listitem">
                  <div className="budget-actual-top">
                    <div className="budget-actual-cat">
                      <CategoryMark category={category} size={15} />
                      <strong className="budget-actual-name" title={category.name}>
                        {category.name}
                      </strong>
                    </div>

                    <div className="budget-actual-metric">
                      <span className="budget-actual-fraction">
                        {formatCurrency(spent)} <span className="fraction-divider">/</span> {formatCurrency(budget)}
                      </span>
                      <span className={`budget-actual-badge ${statusClass}`}>
                        {isOver && <AlertTriangle size={11} className="badge-warn-icon" />}
                        {percentUsed}%
                      </span>
                    </div>
                  </div>

                  <div className="budget-actual-bar-track" aria-hidden="true">
                    <div
                      className={`budget-actual-bar-fill ${statusClass}`}
                      style={{
                        width: `${Math.min(percentUsed, 100)}%`,
                        background: statusColor,
                      }}
                    />
                  </div>

                  <div className="budget-actual-sub">
                    <span className={`budget-actual-status-text ${statusClass}`}>{statusText}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="budget-actual-foot">
            <span className="muted small">
              {budgetedCategories.length} {budgetedCategories.length === 1 ? 'limit configured' : 'limits configured'}
            </span>
            <button
              className="text-link ring-link"
              onClick={() => onNavigate('budgets')}
              type="button"
            >
              Adjust limits <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
