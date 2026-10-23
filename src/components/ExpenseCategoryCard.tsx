import React, { useState } from 'react';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import { AppState, ViewType } from '../types';
import { getCategoryBreakdown } from '../utils/calculations';
import { formatCurrency, formatMonthYear } from '../utils/formatters';
import { CategoryMark } from './CategoryMark';
import { CategoryDonutChart } from './CategoryDonutChart';

interface ExpenseCategoryCardProps {
  state: AppState;
  month: string;
  onNavigate: (view: ViewType) => void;
  onAddTransaction?: () => void;
}

export const ExpenseCategoryCard: React.FC<ExpenseCategoryCardProps> = ({
  state,
  month,
  onNavigate,
  onAddTransaction,
}) => {
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  const { items, total } = getCategoryBreakdown(state, month, 'expense');

  const hasData = items.length > 0 && total > 0;

  return (
    <section className="panel category-analytics-panel expense-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">WHERE IT WENT</span>
          <h2>Expenses by category</h2>
          <p>Spending breakdown for {formatMonthYear(month, 'short')}</p>
        </div>
        <button
          className="text-link"
          onClick={() => onNavigate('budgets')}
          type="button"
          aria-label="View all category budgets"
        >
          Budgets <ArrowUpRight size={14} />
        </button>
      </div>

      {!hasData ? (
        <div className="empty-state compact-empty" style={{ minHeight: '230px', padding: '24px 16px' }}>
          <div className="empty-icon-box purple-glow">
            <ShoppingBag size={26} style={{ color: 'var(--purple)' }} />
          </div>
          <h3 style={{ fontSize: '15px', margin: '10px 0 3px', color: '#e3edf7' }}>No expenses recorded</h3>
          <p style={{ fontSize: '11px', margin: '0 0 14px', color: 'var(--muted)', maxWidth: '280px', lineHeight: 1.5 }}>
            Add an expense transaction to see your spending breakdown for this month.
          </p>
          {onAddTransaction && (
            <button
              className="button button-outline"
              onClick={onAddTransaction}
              type="button"
              style={{ minHeight: '30px', padding: '0 12px', fontSize: '11px' }}
            >
              <ArrowUpRight size={14} /> Add expense
            </button>
          )}
        </div>
      ) : (
        <div className="donut-panel-content">
          <CategoryDonutChart
            items={items}
            total={total}
            centerLabel="TOTAL SPENT"
            activeCategoryId={highlightedCategory}
            onHoverCategory={setHighlightedCategory}
          />

          <div className="donut-legend-container" role="list" aria-label="Expense breakdown by category">
            <div className="donut-legend-scroll">
              {items.map((item) => {
                const isHovered = highlightedCategory === item.categoryId;
                return (
                  <div
                    key={item.categoryId}
                    className={`donut-legend-row ${isHovered ? 'highlighted' : ''}`}
                    onMouseEnter={() => setHighlightedCategory(item.categoryId)}
                    onMouseLeave={() => setHighlightedCategory(null)}
                    role="listitem"
                  >
                    <div className="donut-legend-cat">
                      <CategoryMark category={item.category} size={13} />
                      <span className="donut-legend-name" title={item.name}>
                        {item.name}
                      </span>
                    </div>

                    <div className="donut-legend-values">
                      <strong className="donut-legend-amount">{formatCurrency(item.amount)}</strong>
                      <span className="donut-legend-pct">{item.percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="donut-legend-foot">
              <span className="muted small">
                {items.length} {items.length === 1 ? 'category' : 'categories'}
              </span>
              <button
                className="text-link ring-link"
                onClick={() => onNavigate('budgets')}
                type="button"
              >
                View budgets <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
