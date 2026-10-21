import React, { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { Category } from '../types';
import { Modal } from './Modal';

interface BudgetModalProps {
  category: Category;
  amount: number;
  onSave: (amount: number) => void;
  onClose: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  category,
  amount,
  onSave,
  onClose,
}) => {
  const [val, setVal] = useState(String(amount));
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(val);
    if (!Number.isFinite(num) || num < 0 || num > 1e8) {
      setError('Enter a monthly amount of zero or more.');
      return;
    }
    onSave(Math.round(num * 100) / 100);
  };

  return (
    <Modal
      title={`${category.name} budget`}
      subtitle="This amount repeats each month."
      onClose={onClose}
      narrow
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span>Monthly amount</span>
          <div className="input-prefix">
            <b>₹</b>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="100000000"
              step="0.01"
              value={val}
              onChange={e => setVal(e.target.value)}
              required
            />
          </div>
        </label>
        <p className="field-hint">
          Set this to ₹0 to stop tracking a limit for this category.
        </p>

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
          <button type="submit" className="button button-primary">
            Save budget
          </button>
        </div>
      </form>
    </Modal>
  );
};
