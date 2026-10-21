import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react';
import { ViewType } from '../types';
import { formatMonthYear, offsetMonth } from '../utils/formatters';

interface PageHeaderProps {
  currentView: ViewType;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onAddTransaction: () => void;
}

const VIEW_HEADINGS: Record<ViewType, { title: string; subtitle: string }> = {
  overview: {
    title: 'Your money, in focus.',
    subtitle: 'A clearer view of what came in, what went out, and what’s next.',
  },
  transactions: {
    title: 'Every move, accounted for.',
    subtitle: 'Your income and expenses, all in one place.',
  },
  budgets: {
    title: 'Make room for what matters.',
    subtitle: 'Give every category a plan, then see how you’re doing.',
  },
  insights: {
    title: 'The story behind the numbers.',
    subtitle: 'Useful observations from the numbers you’ve recorded.',
  },
  data: {
    title: 'Your data, your way.',
    subtitle: 'Private by design. Portable whenever you need it.',
  },
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  currentView,
  selectedMonth,
  onMonthChange,
  onAddTransaction,
}) => {
  const { title, subtitle } = VIEW_HEADINGS[currentView];

  return (
    <header className="page-header">
      <div className="page-heading">
        <div className="header-kicker">
          <span className="live-dot" /> YOUR FINANCIAL PICTURE{' '}
          <span className="kicker-divider">/</span>{' '}
          {formatMonthYear(selectedMonth).toUpperCase()}
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-actions">
        <div className="month-control">
          <button
            onClick={() => onMonthChange(offsetMonth(selectedMonth, -1))}
            aria-label="Previous month"
            type="button"
          >
            <ChevronLeft size={17} />
          </button>

          <label className="month-input-wrap">
            <CalendarDays size={16} />
            <span>{formatMonthYear(selectedMonth)}</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => e.target.value && onMonthChange(e.target.value)}
              aria-label="Select month"
            />
          </label>

          <button
            onClick={() => onMonthChange(offsetMonth(selectedMonth, 1))}
            aria-label="Next month"
            type="button"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        <button
          className="button button-primary add-top"
          onClick={onAddTransaction}
          type="button"
        >
          <Plus size={17} />
          <span>Add transaction</span>
        </button>
      </div>
    </header>
  );
};
