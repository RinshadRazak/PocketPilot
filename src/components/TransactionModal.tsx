import React, { useState } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types';
import { Modal } from './Modal';
import { getTodayString, generateId, isValidDateString } from '../utils/formatters';

interface TransactionModalProps {
  categories: Category[];
  initial?: Transaction;
  onSave: (transaction: Transaction) => void;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  categories,
  initial,
  onSave,
  onClose,
}) => {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const [categoryId, setCategoryId] = useState<string>(
    initial?.categoryId ?? categories.find(c => c.kind === (initial?.type ?? 'expense'))?.id ?? ''
  );
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial ? initial.amount.toString() : '');
  const [date, setDate] = useState(initial?.date ?? getTodayString());
  const [error, setError] = useState('');

  const filteredCategories = categories.filter(c => c.kind === type);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = categories.find(c => c.kind === newType);
    setCategoryId(firstCat?.id ?? '');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (description.trim().length > 120) {
      setError('Enter a description up to 120 characters.');
      return;
    }
    if (!Number.isFinite(numAmount) || numAmount <= 0 || numAmount > 1e8) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (!categoryId || !filteredCategories.some(c => c.id === categoryId)) {
      setError('Choose a category for this transaction.');
      return;
    }
    if (!isValidDateString(date)) {
      setError('Choose a valid date.');
      return;
    }

    onSave({
      id: initial?.id ?? generateId(),
      type,
      categoryId,
      description: description.trim(),
      amount: Math.round(numAmount * 100) / 100,
      date,
    });
  };

  return (
    <Modal
      title={initial ? 'Edit transaction' : 'New transaction'}
      subtitle="Every detail stays in this browser."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="type-switch" role="group" aria-label="Transaction type">
          <button
            type="button"
            className={type === 'expense' ? 'active' : ''}
            onClick={() => handleTypeChange('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={type === 'income' ? 'active' : ''}
            onClick={() => handleTypeChange('income')}
          >
            Income
          </button>
        </div>

        <div className="field-grid">
          <label className="field field-wide">
            <span>Description</span>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Where did the money go?"
              maxLength={120}
            />
          </label>

          <label className="field">
            <span>Amount</span>
            <div className="input-prefix">
              <b>₹</b>
              <input
                inputMode="decimal"
                type="number"
                min="0.01"
                max="100000000"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </label>

          <label className="field field-wide">
            <span>Category</span>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              required
            >
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="form-error">
            <CircleAlert size={15} />
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="button button-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button button-primary" type="submit">
            <Check size={16} />
            {initial ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
