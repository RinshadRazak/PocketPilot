import React from 'react';
import { AppState } from '../types';
import { getCategorySpendingForMonth } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';

interface SpendingRingProps {
  state: AppState;
  month: string;
  onViewBudgets: () => void;
}

export const SpendingRing: React.FC<SpendingRingProps> = ({
  state,
  month,
  onViewBudgets,
}) => {
  const spendingMap = getCategorySpendingForMonth(state, month);
  const activeExpenseCategories = state.categories
    .filter(c => c.kind === 'expense' && (spendingMap[c.id] ?? 0) > 0)
    .sort((a, b) => (spendingMap[b.id] ?? 0) - (spendingMap[a.id] ?? 0));

  const totalSpent = activeExpenseCategories.reduce(
    (acc, c) => acc + spendingMap[c.id],
    0
  );

  let currentPercent = 0;
  const gradientStops = activeExpenseCategories.map(c => {
    const start = currentPercent;
    currentPercent += (spendingMap[c.id] / totalSpent) * 100;
    return `${c.color} ${start}% ${currentPercent}%`;
  });

  const backgroundGradient =
    totalSpent > 0
      ? `conic-gradient(${gradientStops.join(', ')})`
      : 'conic-gradient(#24334b 0 100%)';

  const ariaDescription = `Spending by category: ${activeExpenseCategories
    .map(c => `${c.name} ${formatCurrency(spendingMap[c.id])}`)
    .join(', ') || 'no expenses'}`;

  return (
    <div className="spending-content">
      <div className="ring-wrap">
        <div
          className="spending-ring"
          style={{ background: backgroundGradient }}
          role="img"
          aria-label={ariaDescription}
        >
          <div className="ring-core">
            <span>TOTAL SPENT</span>
            <strong>{formatCurrency(totalSpent)}</strong>
          </div>
        </div>
      </div>

      <div className="spending-legend">
        {activeExpenseCategories.slice(0, 4).map(c => (
          <div className="legend-row" key={c.id}>
            <span className="legend-name">
              <i style={{ background: c.color }} />
              {c.name}
            </span>
            <span className="legend-value">
              {Math.round((spendingMap[c.id] / totalSpent) * 100)}%
            </span>
          </div>
        ))}

        {activeExpenseCategories.length > 4 && (
          <div className="legend-row">
            <span className="legend-name">
              <i className="other-dot" />
              Other categories
            </span>
            <span className="legend-value">
              {Math.round(
                (activeExpenseCategories
                  .slice(4)
                  .reduce((acc, c) => acc + spendingMap[c.id], 0) /
                  totalSpent) *
                  100
              )}
              %
            </span>
          </div>
        )}

        {!activeExpenseCategories.length && (
          <p className="muted empty-compact">No expenses in this month yet.</p>
        )}

        <button className="text-link ring-link" onClick={onViewBudgets} type="button">
          View all categories <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
};
