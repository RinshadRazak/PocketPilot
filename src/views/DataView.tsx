import React from 'react';
import {
  TriangleAlert,
  ArrowDownToLine,
  Upload,
  Download,
  Trash2,
  Repeat2,
  History,
} from 'lucide-react';
import { AppState } from '../types';

interface DataViewProps {
  state: AppState;
  hasBackup: boolean;
  hasDemoBackup?: boolean;
  onOpenImport: () => void;
  onExportCsv: () => void;
  onDownloadBackup: () => void;
  onDownloadDemoBackup?: () => void;
  onRestoreDemoBackup?: () => void;
  onClearTransactions: () => void;
  onRestoreDefaults: () => void;
}

export const DataView: React.FC<DataViewProps> = ({
  state,
  hasBackup,
  hasDemoBackup,
  onOpenImport,
  onExportCsv,
  onDownloadBackup,
  onDownloadDemoBackup,
  onRestoreDemoBackup,
  onClearTransactions,
  onRestoreDefaults,
}) => {
  return (
    <div className="view-content">
      <div className="section-head">
        <div>
          <span className="eyebrow">DATA & PRIVACY</span>
          <h2>Take your records with you</h2>
          <p>
            Your financial information lives in this browser. Keep a copy wherever you
            like.
          </p>
        </div>
      </div>

      {hasBackup && (
        <section className="recovery-banner">
          <TriangleAlert size={20} />
          <div>
            <strong>Some saved records could not be read.</strong>
            <p>
              The original file was kept separately. Download it before making further
              changes or clearing browser data.
            </p>
          </div>
          <button
            className="button button-outline"
            onClick={onDownloadBackup}
            type="button"
          >
            Download backup
          </button>
        </section>
      )}

      {hasDemoBackup && (
        <section className="recovery-banner" style={{ borderColor: 'rgba(116, 246, 200, 0.28)', background: 'rgba(23, 59, 70, 0.35)', color: '#d5f7ec' }}>
          <History size={20} style={{ color: 'var(--mint)' }} />
          <div>
            <strong style={{ color: '#ebfaf4' }}>Pre-cleanup backup saved.</strong>
            <p style={{ color: '#9cc2b8' }}>
              A copy of your previous records was preserved before demo data cleanup.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onDownloadDemoBackup && (
              <button
                className="button button-outline"
                onClick={onDownloadDemoBackup}
                type="button"
              >
                Download copy
              </button>
            )}
            {onRestoreDemoBackup && (
              <button
                className="button button-outline"
                onClick={onRestoreDemoBackup}
                type="button"
              >
                Revert cleanup
              </button>
            )}
          </div>
        </section>
      )}

      <div className="data-grid">
        <section className="panel data-card">
          <span className="data-card-icon mint">
            <ArrowDownToLine size={23} />
          </span>
          <h2>Import your records</h2>
          <p>
            Bring in transactions from a CSV file or move your PocketPilot records from
            another browser. You’ll review the file before anything changes.
          </p>
          <button
            className="button button-primary"
            onClick={onOpenImport}
            type="button"
          >
            <Upload size={17} /> Import CSV
          </button>
        </section>

        <section className="panel data-card">
          <span className="data-card-icon purple">
            <Download size={23} />
          </span>
          <h2>Keep a copy</h2>
          <p>
            Download one CSV with every transaction, category, and monthly limit. It’s
            yours to keep and bring back whenever you need it.
          </p>
          <button
            className="button button-outline"
            onClick={onExportCsv}
            type="button"
          >
            <Download size={17} /> Export CSV
          </button>
        </section>
      </div>

      <section className="panel storage-panel">
        <div>
          <span className="eyebrow">LOCAL STORAGE</span>
          <h2>Only on this device</h2>
          <p>
            No account, no syncing, no server-side record of your finances. Clearing
            browser storage will remove your records, so export a copy before you do.
          </p>
        </div>
        <div className="storage-stats">
          <div>
            <strong>{state.transactions.length}</strong>
            <span>transactions</span>
          </div>
          <div>
            <strong>{state.categories.length}</strong>
            <span>categories</span>
          </div>
        </div>
      </section>

      <section className="panel reset-panel">
        <div>
          <span className="eyebrow">FRESH START</span>
          <h2>Manage local records</h2>
          <p>These actions only affect the data stored in this browser.</p>
        </div>
        <div className="reset-actions">
          <button
            className="button button-outline"
            onClick={onClearTransactions}
            type="button"
          >
            <Trash2 size={16} /> Clear transactions
          </button>
          <button
            className="button button-outline"
            onClick={onRestoreDefaults}
            type="button"
          >
            <Repeat2 size={16} /> Restore starting records
          </button>
        </div>
      </section>
    </div>
  );
};
