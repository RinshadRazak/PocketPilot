import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Activity,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { AppState, ViewType } from '../types';
import {
  getMonthSummary,
  getCategorySpendingForMonth,
  generateInsights,
  getTransactionsForMonth,
} from '../utils/calculations';
import { formatCurrency, formatMonthYear } from '../utils/formatters';
import { TrendChart } from '../components/TrendChart';
import { SpendingRing } from '../components/SpendingRing';
import { InsightCard } from '../components/InsightCard';
import { TransactionRow } from '../components/TransactionRow';

interface OverviewViewProps {
  state: AppState;
  selectedMonth: string;
  onNavigate: (view: ViewType) => void;
  onAddTransaction?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  selectedMonth,
  onNavigate,
  onAddTransaction,
}) => {
  const summary = getMonthSummary(state, selectedMonth);
  const spendingMap = getCategorySpendingForMonth(state, selectedMonth);
  const insights = generateInsights(state, selectedMonth);
  const monthTransactions = getTransactionsForMonth(state, selectedMonth);

  const activeCategoryCount = Object.keys(spendingMap).filter(
    k => spendingMap[k] > 0
  ).length;

  const recentTransactions = [...monthTransactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, 5);

  return (
    <div className="view-content overview-view">
      <div className="stat-grid">
        <article className="stat-card stat-feature">
          <div className="feature-glow" />
          <div className="stat-top">
            <span>LEFT AFTER SPENDING</span>
            <span className="stat-icon">
              <Wallet size={18} />
            </span>
          </div>
          <strong className="stat-number">{formatCurrency(summary.balance, 2)}</strong>
          <div className="stat-foot">
            <span className="feature-pill">
              <span className="small-dot" /> {formatMonthYear(selectedMonth)}
            </span>
            <span>Income minus expenses</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>INCOME</span>
            <span className="stat-icon stat-mint">
              <ArrowDownLeft size={19} />
            </span>
          </div>
          <strong className="stat-number">{formatCurrency(summary.income)}</strong>
          <div className="stat-foot">
            <span className="stat-helper">
              <span className="helper-line mint" /> Money in this month
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>SPENT</span>
            <span className="stat-icon stat-purple">
              <ArrowUpRight size={19} />
            </span>
          </div>
          <strong className="stat-number">{formatCurrency(summary.expenses)}</strong>
          <div className="stat-foot">
            <span className="stat-helper">
              <span className="helper-line purple" /> Across {activeCategoryCount} categories
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>BUDGET LEFT</span>
            <span className="stat-icon stat-blue">
              <Activity size={19} />
            </span>
          </div>
          <strong
            className={`stat-number ${summary.remaining < 0 ? 'negative' : ''}`}
          >
            {formatCurrency(summary.remaining)}
          </strong>
          <div className="stat-foot">
            <span className="stat-helper">
              {summary.budget
                ? `${Math.round((summary.budgetedSpent / summary.budget) * 100)}% of ${formatCurrency(summary.budget)} planned`
                : 'Set a monthly budget'}
            </span>
          </div>
        </article>
      </div>

      <div className="analytics-grid">
        <section className="panel trend-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">THE BIG PICTURE</span>
              <h2>Cash flow over time</h2>
              <p>Six months of money in and money out</p>
            </div>
            <div className="chart-legend">
              <span>
                <i className="mint" />
                Income
              </span>
              <span>
                <i className="purple" />
                Expenses
              </span>
            </div>
          </div>
          <TrendChart state={state} month={selectedMonth} />
        </section>

        <section className="panel breakdown-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">WHERE IT WENT</span>
              <h2>Spending mix</h2>
              <p>By category this month</p>
            </div>
            <button
              className="icon-button subtle"
              onClick={() => onNavigate('budgets')}
              aria-label="View category budgets"
              type="button"
            >
              <ArrowUpRight size={19} />
            </button>
          </div>
          <SpendingRing
            state={state}
            month={selectedMonth}
            onViewBudgets={() => onNavigate('budgets')}
          />
        </section>
      </div>

      <div className="lower-grid">
        <section className="panel insights-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">A CLOSER LOOK</span>
              <h2>Worth knowing</h2>
            </div>
            <button
              className="text-link"
              onClick={() => onNavigate('insights')}
              type="button"
            >
              All insights <ArrowRight size={15} />
            </button>
          </div>
          <div className="insight-list">
            {insights.slice(0, 2).map(ins => (
              <InsightCard key={ins.id} insight={ins} compact />
            ))}
          </div>
        </section>

        <section className="panel recent-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">LATEST ACTIVITY</span>
              <h2>Recent transactions</h2>
            </div>
            <button
              className="text-link"
              onClick={() => onNavigate('transactions')}
              type="button"
            >
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div className="transaction-list">
            {recentTransactions.length ? (
              recentTransactions.map(t => {
                const category = state.categories.find(c => c.id === t.categoryId);
                return (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    category={category}
                    compact
                  />
                );
              })
            ) : (
              <div className="empty-state compact-empty" style={{ gap: '10px' }}>
                <p style={{ margin: 0 }}>No activity this month yet.</p>
                {onAddTransaction && (
                  <button
                    className="button button-outline"
                    onClick={onAddTransaction}
                    type="button"
                    style={{ minHeight: '32px', padding: '0 12px', fontSize: '11px' }}
                  >
                    <Plus size={14} /> Add transaction
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
