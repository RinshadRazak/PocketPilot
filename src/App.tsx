import React, { useState, useEffect, useRef } from 'react';
import {
  AppState,
  ViewType,
  Transaction,
  Category,
  ConfirmDialogState,
  ParsedCsvData,
} from './types';
import {
  loadInitialState,
  saveStateToStorage,
  generateSeedData,
  validateState,
} from './utils/storage';
import {
  STORAGE_KEY,
  BACKUP_KEY,
} from './utils/constants';
import {
  getCurrentMonthKey,
  getTodayString,
  formatCurrency,
} from './utils/formatters';
import {
  exportToCsv,
  mergeCsvRecords,
  replaceWithCsvRecords,
} from './utils/csv';
import { Sidebar } from './components/Sidebar';
import { PageHeader } from './components/PageHeader';
import { MobileHeader, MobileTabBar, Footer, Toast } from './components/ShellComponents';
import { OverviewView } from './views/OverviewView';
import { TransactionsView } from './views/TransactionsView';
import { BudgetsView } from './views/BudgetsView';
import { InsightsView } from './views/InsightsView';
import { DataView } from './views/DataView';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import { BudgetModal } from './components/BudgetModal';
import { ImportModal } from './components/ImportModal';
import { ConfirmModal } from './components/ConfirmModal';

export const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadInitialState);
  const stateRef = useRef<AppState>(state);
  stateRef.current = state;

  const [hasBackup, setHasBackup] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(BACKUP_KEY);
    } catch {
      return false;
    }
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Modals
  const [activeTransactionModal, setActiveTransactionModal] = useState<Transaction | boolean | null>(null);
  const [activeCategoryModal, setActiveCategoryModal] = useState<Category | boolean | null>(null);
  const [activeBudgetModal, setActiveBudgetModal] = useState<Category | null>(null);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => setToastMessage(msg);

  // Multi-tab storage synchronization and initial persist
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current));
      }
    } catch {
      showToast('Browser storage is full or unavailable. Export your records to keep a copy.');
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return;
      const valid = validateState(JSON.parse(e.newValue || '{}'));
      if (valid) {
        stateRef.current = valid;
        setState(valid);
        showToast('Records were updated in another tab.');
      } else if (e.newValue === null) {
        const fresh = generateSeedData();
        stateRef.current = fresh;
        setState(fresh);
        showToast('Browser records changed in another tab.');
      } else {
        try {
          localStorage.setItem(BACKUP_KEY, e.newValue);
          setHasBackup(true);
        } catch {
          // ignore
        }
        showToast('Some external records could not be read. A backup is available in Data & privacy.');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-dismiss toast after 4.2 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(''), 4200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    const next = updater(stateRef.current);
    stateRef.current = next;
    setState(next);
    const success = saveStateToStorage(next);
    if (!success) {
      showToast('Browser storage is full or unavailable. Export your records to keep a copy.');
    }
  };

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Transactions handlers
  const handleSaveTransaction = (transaction: Transaction) => {
    let isEdit = false;
    updateState(prev => {
      isEdit = prev.transactions.some(t => t.id === transaction.id);
      return {
        ...prev,
        transactions: isEdit
          ? prev.transactions.map(t => (t.id === transaction.id ? transaction : t))
          : [...prev.transactions, transaction],
      };
    });
    setActiveTransactionModal(null);
    showToast(isEdit ? 'Transaction updated.' : 'Transaction added.');
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    const title = transaction.description.trim() || 'Transaction';
    setConfirmDialog({
      title: 'Delete this transaction?',
      message: `${title} · ${formatCurrency(transaction.amount, 2)} will be removed from your records. This cannot be undone.`,
      confirmLabel: 'Delete transaction',
      dangerous: true,
      action: () => {
        updateState(prev => ({
          ...prev,
          transactions: prev.transactions.filter(t => t.id !== transaction.id),
        }));
        setConfirmDialog(null);
        showToast('Transaction deleted.');
      },
    });
  };

  // Categories handlers
  const handleSaveCategory = (category: Category) => {
    let isEdit = false;
    updateState(prev => {
      isEdit = prev.categories.some(c => c.id === category.id);
      return {
        ...prev,
        categories: isEdit
          ? prev.categories.map(c => (c.id === category.id ? category : c))
          : [...prev.categories, category],
        budgets:
          category.kind === 'expense' && !isEdit
            ? { ...prev.budgets, [category.id]: 0 }
            : prev.budgets,
      };
    });
    setActiveCategoryModal(null);
    showToast(isEdit ? 'Category updated.' : 'Category added.');
  };

  const handleDeleteCategory = (category: Category) => {
    if (stateRef.current.transactions.some(t => t.categoryId === category.id)) {
      showToast('This category has transactions. Move or delete them before removing it.');
      return;
    }

    setConfirmDialog({
      title: `Remove ${category.name}?`,
      message: 'This category and its monthly limit will be removed. This cannot be undone.',
      confirmLabel: 'Remove category',
      dangerous: true,
      action: () => {
        let hasTxs = false;
        updateState(prev => {
          if (prev.transactions.some(t => t.categoryId === category.id)) {
            hasTxs = true;
            return prev;
          }
          const nextBudgets = { ...prev.budgets };
          delete nextBudgets[category.id];
          return {
            ...prev,
            budgets: nextBudgets,
            categories: prev.categories.filter(c => c.id !== category.id),
          };
        });
        setConfirmDialog(null);
        showToast(
          hasTxs
            ? 'This category now has transactions. Move them before removing it.'
            : 'Category removed.'
        );
      },
    });
  };

  // Budget limits handler
  const handleSaveBudget = (amount: number) => {
    if (activeBudgetModal) {
      updateState(prev => ({
        ...prev,
        budgets: {
          ...prev.budgets,
          [activeBudgetModal.id]: amount,
        },
      }));
      setActiveBudgetModal(null);
      showToast('Monthly budget updated.');
    }
  };

  // CSV Import handler
  const handleApplyImport = (parsed: ParsedCsvData, mode: 'merge' | 'replace') => {
    try {
      let added = 0;
      let skipped = 0;
      updateState(prev => {
        const res =
          mode === 'replace'
            ? replaceWithCsvRecords(parsed)
            : mergeCsvRecords(prev, parsed);
        added = res.added;
        skipped = res.skipped;
        return res.state;
      });
      setImportModalOpen(false);
      showToast(
        mode === 'replace'
          ? `${added} transactions restored from CSV.`
          : `${added} transaction${added === 1 ? '' : 's'} imported${skipped ? ` · ${skipped} already here` : ''}.`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'The CSV could not be imported.');
    }
  };

  // CSV Export handler
  const handleExportCsv = () => {
    const csvContent = exportToCsv(state);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketpilot-records-${getTodayString()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('CSV downloaded.');
  };

  // Download raw backup
  const handleDownloadBackup = () => {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketpilot-recovery-${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Clear transactions handler
  const handleClearTransactions = () => {
    setConfirmDialog({
      title: 'Clear all transactions?',
      message:
        'Every income and expense entry will be removed from this browser. Your categories and monthly budgets will stay. Export a CSV first if you want a copy.',
      confirmLabel: 'Clear transactions',
      dangerous: true,
      action: () => {
        updateState(prev => ({ ...prev, transactions: [] }));
        setConfirmDialog(null);
        showToast('Transactions cleared.');
      },
    });
  };

  // Restore starting records handler
  const handleRestoreDefaults = () => {
    setConfirmDialog({
      title: 'Restore starting data?',
      message:
        'This replaces all current transactions, categories, and budgets with the original starting records in this browser. Export a CSV first if you want a copy.',
      confirmLabel: 'Restore records',
      dangerous: true,
      action: () => {
        const seed = generateSeedData();
        updateState(() => seed);
        setSelectedMonth(getCurrentMonthKey());
        setConfirmDialog(null);
        showToast('Starting records restored.');
      },
    });
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        mobileOpen={mobileNavOpen}
      />

      <MobileHeader
        onNavigate={handleNavigate}
        mobileOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
      />

      <main className="main-content">
        <PageHeader
          currentView={currentView}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onAddTransaction={() => setActiveTransactionModal(true)}
        />

        {currentView === 'overview' && (
          <OverviewView
            state={state}
            selectedMonth={selectedMonth}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'transactions' && (
          <TransactionsView
            state={state}
            selectedMonth={selectedMonth}
            onOpenImport={() => setImportModalOpen(true)}
            onExportCsv={handleExportCsv}
            onAddTransaction={() => setActiveTransactionModal(true)}
            onEditTransaction={t => setActiveTransactionModal(t)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {currentView === 'budgets' && (
          <BudgetsView
            state={state}
            selectedMonth={selectedMonth}
            onAddCategory={() => setActiveCategoryModal(true)}
            onEditCategory={c => setActiveCategoryModal(c)}
            onDeleteCategory={handleDeleteCategory}
            onEditBudget={c => setActiveBudgetModal(c)}
          />
        )}

        {currentView === 'insights' && (
          <InsightsView
            state={state}
            selectedMonth={selectedMonth}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'data' && (
          <DataView
            state={state}
            hasBackup={hasBackup}
            onOpenImport={() => setImportModalOpen(true)}
            onExportCsv={handleExportCsv}
            onDownloadBackup={handleDownloadBackup}
            onClearTransactions={handleClearTransactions}
            onRestoreDefaults={handleRestoreDefaults}
          />
        )}

        <Footer />
      </main>

      <MobileTabBar currentView={currentView} onNavigate={handleNavigate} />

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
      )}

      {activeTransactionModal && (
        <TransactionModal
          categories={state.categories}
          initial={
            typeof activeTransactionModal === 'object'
              ? activeTransactionModal
              : undefined
          }
          onSave={handleSaveTransaction}
          onClose={() => setActiveTransactionModal(null)}
        />
      )}

      {activeCategoryModal && (
        <CategoryModal
          categories={state.categories}
          initial={
            typeof activeCategoryModal === 'object'
              ? activeCategoryModal
              : undefined
          }
          onSave={handleSaveCategory}
          onClose={() => setActiveCategoryModal(null)}
        />
      )}

      {activeBudgetModal && (
        <BudgetModal
          category={activeBudgetModal}
          amount={state.budgets[activeBudgetModal.id] ?? 0}
          onSave={handleSaveBudget}
          onClose={() => setActiveBudgetModal(null)}
        />
      )}

      {importModalOpen && (
        <ImportModal
          onApply={handleApplyImport}
          onClose={() => setImportModalOpen(false)}
        />
      )}

      {confirmDialog && (
        <ConfirmModal
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          dangerous={confirmDialog.dangerous}
          onConfirm={confirmDialog.action}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};
export default App;
