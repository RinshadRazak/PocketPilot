import React, { useState, useMemo } from 'react';
import { Upload, Download, Search, Plus } from 'lucide-react';
import { AppState, Transaction } from '../types';
import { getTransactionsForMonth } from '../utils/calculations';
import { formatMonthYear } from '../utils/formatters';
import { TransactionRow } from '../components/TransactionRow';

interface TransactionsViewProps {
  state: AppState;
  selectedMonth: string;
  onOpenImport: () => void;
  onExportCsv: () => void;
  onAddTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  state,
  selectedMonth,
  onOpenImport,
  onExportCsv,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const monthTransactions = useMemo(
    () => getTransactionsForMonth(state, selectedMonth),
    [state, selectedMonth]
  );

  const filteredTransactions = useMemo(() => {
    return monthTransactions
      .filter(t => typeFilter === 'all' || t.type === typeFilter)
      .filter(t => categoryFilter === 'all' || t.categoryId === categoryFilter)
      .filter(t => {
        const cat = state.categories.find(c => c.id === t.categoryId);
        const query = search.toLowerCase().trim();
        const combined = `${t.description} ${cat?.name ?? 'Uncategorized'}`.toLowerCase();
        return combined.includes(query);
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [monthTransactions, typeFilter, categoryFilter, search, state.categories]);

  const availableCategories = state.categories.filter(
    c => typeFilter === 'all' || c.kind === typeFilter
  );

  return (
    <div className="view-content">
      <div className="content-toolbar">
        <div className="toolbar-title">
          <span className="eyebrow">ACTIVITY LEDGER</span>
          <h2>
            {formatMonthYear(selectedMonth)} transactions{' '}
            <span className="count-pill">{filteredTransactions.length}</span>
          </h2>
        </div>
        <div className="toolbar-buttons">
          <button
            className="button button-outline"
            onClick={onOpenImport}
            type="button"
          >
            <Upload size={16} /> Import CSV
          </button>
          <button
            className="button button-outline"
            onClick={onExportCsv}
            type="button"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <section className="panel ledger-panel">
        <div className="filter-bar">
          <label className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions"
              aria-label="Search transactions"
            />
          </label>

          <select
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value);
              setCategoryFilter('all');
            }}
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {availableCategories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ledger-labels">
          <span>TRANSACTION</span>
          <span>AMOUNT</span>
        </div>

        <div className="transaction-list ledger-list">
          {filteredTransactions.length ? (
            filteredTransactions.map(t => {
              const category = state.categories.find(c => c.id === t.categoryId);
              return (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  category={category}
                  onEdit={onEditTransaction}
                  onDelete={onDeleteTransaction}
                />
              );
            })
          ) : (
            <div className="empty-state">
              <Search size={28} />
              <h3>No transactions found</h3>
              <p>Try another month or filter, or add your first entry.</p>
              <button
                className="button button-primary"
                onClick={onAddTransaction}
                type="button"
              >
                <Plus size={16} /> Add transaction
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
