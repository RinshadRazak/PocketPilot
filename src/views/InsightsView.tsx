import React from 'react';
import { LockKeyhole, ArrowRight } from 'lucide-react';
import { AppState, ViewType } from '../types';
import { generateInsights, getCategorySpendingForMonth } from '../utils/calculations';
import { formatCurrency, formatMonthYear, toCents } from '../utils/formatters';
import { InsightCard } from '../components/InsightCard';

interface InsightsViewProps {
  state: AppState;
  selectedMonth: string;
  onNavigate: (view: ViewType) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  state,
  selectedMonth,
  onNavigate,
}) => {
  const insights = generateInsights(state, selectedMonth);
  const spendingMap = getCategorySpendingForMonth(state, selectedMonth);

  const activeExpenseCategories = state.categories
    .filter(c => c.kind === 'expense' && (spendingMap[c.id] ?? 0) > 0)
    .sort((a, b) => (spendingMap[b.id] ?? 0) - (spendingMap[a.id] ?? 0));

  return (
    <div className="view-content">
      <div className="section-head">
        <div>
          <span className="eyebrow">PATTERNS THAT MATTER</span>
          <h2>What {formatMonthYear(selectedMonth)} is telling you</h2>
          <p>
            No guesswork. Just observations from the transactions in this browser.
          </p>
        </div>
      </div>

      <div className="insight-grid">
        {insights.map(ins => (
          <InsightCard key={ins.id} insight={ins} />
        ))}
      </div>

      <div className="insights-detail-grid">
        <section className="panel insight-detail-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">CATEGORY CHECK-IN</span>
              <h2>Budget health</h2>
            </div>
          </div>

          <div className="health-list">
            {activeExpenseCategories.map(cat => {
              const budget = state.budgets[cat.id] ?? 0;
              const spent = spendingMap[cat.id] ?? 0;
              const isOver = toCents(budget) > 0 && toCents(spent) > toCents(budget);

              return (
                <div className="health-row" key={cat.id}>
                  <span className="legend-name">
                    <i style={{ background: cat.color }} />
                    {cat.name}
                  </span>
                  <span className={isOver ? 'negative' : ''}>
                    {budget ? `${Math.round((spent / budget) * 100)}% of limit` : 'No limit'}
                  </span>
                  <strong>{formatCurrency(spent)}</strong>
                </div>
              );
            })}

            {!activeExpenseCategories.length && (
              <p className="muted">Add an expense to see category patterns.</p>
            )}
          </div>
        </section>

        <section className="panel privacy-panel">
          <span className="privacy-panel-icon">
            <LockKeyhole size={23} />
          </span>
          <span className="eyebrow">A LITTLE PEACE OF MIND</span>
          <h2>Your numbers stay with you.</h2>
          <p>
            These observations are calculated on your device from the records you keep
            here. Nothing is sent to an account.
          </p>
          <button
            className="text-link"
            onClick={() => onNavigate('data')}
            type="button"
          >
            Manage your data <ArrowRight size={16} />
          </button>
        </section>
      </div>
    </div>
  );
};
