import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Transaction, Category } from '../types';
import { CategoryMark } from './CategoryMark';
import { formatDateDisplay, formatCurrency } from '../utils/formatters';

interface TransactionRowProps {
  transaction: Transaction;
  category?: Category;
  compact?: boolean;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  category,
  compact = false,
  onEdit,
  onDelete,
}) => {
  const displayTitle = transaction.description.trim() || category?.name || 'Transaction';

  return (
    <div className={`transaction-row ${compact ? 'row-compact' : ''}`}>
      <CategoryMark category={category} />
      <div className="transaction-name">
        <strong>{displayTitle}</strong>
        <span>
          {category?.name ?? 'Uncategorized'} <i>·</i> {formatDateDisplay(transaction.date)}
        </span>
      </div>
      <div className={`transaction-amount ${transaction.type === 'income' ? 'income' : ''}`}>
        {transaction.type === 'income' ? '+' : '−'}
        {formatCurrency(transaction.amount, 2)}
      </div>
      {!compact && (
        <div className="row-actions">
          <button
            className="icon-button"
            onClick={() => onEdit?.(transaction)}
            aria-label={`Edit ${displayTitle}`}
            title="Edit transaction"
            type="button"
          >
            <Pencil size={16} />
          </button>
          <button
            className="icon-button"
            onClick={() => onDelete?.(transaction)}
            aria-label={`Delete ${displayTitle}`}
            title="Delete transaction"
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
