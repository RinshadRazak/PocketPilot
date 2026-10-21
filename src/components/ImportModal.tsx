import React, { useState, useRef } from 'react';
import { CloudUpload, CircleAlert, FileSpreadsheet, ArrowDownToLine } from 'lucide-react';
import { ParsedCsvData } from '../types';
import { Modal } from './Modal';
import { parseCsv } from '../utils/csv';

interface ImportModalProps {
  onApply: (data: ParsedCsvData, mode: 'merge' | 'replace') => void;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onApply, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reqSeq = useRef(0);

  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedCsvData | null>(null);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');

  const handleFile = async (file?: File) => {
    if (!file) return;
    const currentSeq = ++reqSeq.current;

    setFileName(file.name);
    setError('');
    setParsed(null);
    setReading(false);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Choose a .csv file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Choose a CSV smaller than 5 MB.');
      return;
    }

    setReading(true);
    try {
      const text = await file.text();
      if (currentSeq === reqSeq.current) {
        setParsed(parseCsv(text));
      }
    } catch (err) {
      if (currentSeq === reqSeq.current) {
        setError(err instanceof Error ? err.message : 'This CSV could not be read.');
      }
    } finally {
      if (currentSeq === reqSeq.current) {
        setReading(false);
      }
    }
  };

  const isSubmitDisabled =
    !parsed ||
    (!parsed.transactions.length && !parsed.categories.length) ||
    (mode === 'replace' && parsed.errorCount > 0);

  return (
    <Modal
      title="Import CSV"
      subtitle="Review everything before it joins your records."
      onClose={onClose}
    >
      <div className="import-body">
        <input
          ref={fileInputRef}
          className="visually-hidden"
          type="file"
          accept=".csv,text/csv"
          tabIndex={-1}
          onChange={e => handleFile(e.target.files?.[0])}
        />

        <button
          className="upload-zone"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <span className="upload-icon">
            <CloudUpload size={25} />
          </span>
          <strong>{fileName || 'Choose a CSV file'}</strong>
          <span>Click to browse or drag a file here · Up to 5 MB</span>
        </button>

        {reading && <p className="muted">Reading your file…</p>}

        {error && (
          <p className="form-error">
            <CircleAlert size={15} />
            {error}
          </p>
        )}

        {parsed && (
          <div className="import-preview">
            <div className="import-preview-title">
              <FileSpreadsheet size={18} />
              <strong>Ready to review</strong>
            </div>

            <div className="import-stats">
              <div>
                <strong>{parsed.transactions.length}</strong>
                <span>transactions</span>
              </div>
              <div>
                <strong>{parsed.categories.length}</strong>
                <span>category rows</span>
              </div>
              <div>
                <strong>{parsed.errorCount}</strong>
                <span>invalid rows</span>
              </div>
            </div>

            {parsed.errorCount > 0 && (
              <div className="import-errors">
                <strong>Rows needing attention</strong>
                {parsed.errors.slice(0, 5).map(err => (
                  <p key={err.row}>
                    Row {err.row}: {err.message}
                  </p>
                ))}
                {parsed.errorCount > 5 && (
                  <p>And {parsed.errorCount - 5} more rows.</p>
                )}
              </div>
            )}

            <div
              className="import-modes"
              role="radiogroup"
              aria-label="How to import records"
            >
              <label>
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === 'merge'}
                  onChange={() => setMode('merge')}
                />
                <span>
                  <strong>Add to current records</strong>
                  <small>
                    Keep what’s here; update matching budgets and skip matching transaction IDs.
                  </small>
                </span>
              </label>

              <label>
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                />
                <span>
                  <strong>Replace current records</strong>
                  <small>
                    Restore the file as your full record, including category names and colors.
                  </small>
                </span>
              </label>
            </div>

            {mode === 'replace' && (
              <p className="replace-warning">
                <CircleAlert size={16} /> This removes all current transactions, categories, and budgets. Export a copy first. Every CSV row must be valid.
              </p>
            )}

            <p className="field-hint">Nothing changes until you confirm.</p>
          </div>
        )}

        <div className="modal-actions">
          <button className="button button-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`button ${mode === 'replace' ? 'button-danger' : 'button-primary'}`}
            type="button"
            disabled={isSubmitDisabled}
            onClick={() => parsed && onApply(parsed, mode)}
          >
            <ArrowDownToLine size={16} />
            {mode === 'replace' ? 'Replace records' : 'Import records'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
