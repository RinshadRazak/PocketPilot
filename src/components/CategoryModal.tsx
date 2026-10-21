import React, { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { Category, TransactionType } from '../types';
import { Modal } from './Modal';
import { CATEGORY_COLORS } from '../utils/constants';
import { generateId } from '../utils/formatters';

interface CategoryModalProps {
  categories: Category[];
  initial?: Category;
  onSave: (category: Category) => void;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  categories,
  initial,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [kind, setKind] = useState<TransactionType>(initial?.kind ?? 'expense');
  const [color, setColor] = useState(
    initial?.color ?? CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed || trimmed.length > 60) {
      setError('Enter a category name up to 60 characters.');
      return;
    }

    const duplicate = categories.some(
      c =>
        c.id !== initial?.id &&
        c.kind === kind &&
        c.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicate) {
      setError('A category with that name already exists.');
      return;
    }

    onSave({
      id: initial?.id ?? generateId(),
      name: trimmed,
      kind,
      color,
    });
  };

  return (
    <Modal
      title={initial ? 'Edit category' : 'New category'}
      subtitle="Keep your spending organized your way."
      onClose={onClose}
      narrow
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {!initial && (
          <div className="type-switch" role="group" aria-label="Category type">
            <button
              type="button"
              className={kind === 'expense' ? 'active' : ''}
              onClick={() => setKind('expense')}
            >
              Expense
            </button>
            <button
              type="button"
              className={kind === 'income' ? 'active' : ''}
              onClick={() => setKind('income')}
            >
              Income
            </button>
          </div>
        )}

        <label className="field">
          <span>Category name</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Pet care"
            maxLength={60}
            required
          />
        </label>

        <div className="field">
          <span>Accent color</span>
          <div className="color-picker">
            {CATEGORY_COLORS.map(c => (
              <button
                key={c}
                type="button"
                aria-label={`Select ${c} color`}
                aria-pressed={color === c}
                className={color === c ? 'selected' : ''}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
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
          <button type="submit" className="button button-primary">
            {initial ? 'Save category' : 'Add category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
