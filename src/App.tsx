import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetsView } from './components/BudgetsView';
import { MembersView } from './components/MembersView';
import { TransactionModal } from './components/TransactionModal';
import { ShareModal } from './components/ShareModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { AuthModal } from './components/AuthModal';
import type { Transaction, TransactionType } from './types';
import { Download, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { t } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // PWA Install prompt
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleOpenNewTransaction = (type: TransactionType = 'expense', editTx?: Transaction) => {
    setTransactionModalType(type);
    setEditingTransaction(editTx || null);
    setTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenShareModal={() => setShareModalOpen(true)}
        onOpenWorkspaceModal={() => setWorkspaceModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* PWA Install Notification Bar */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 text-xs sm:text-sm flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="font-medium">{t('install_desc')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallPWA}
              className="px-3 py-1 bg-white text-indigo-700 font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t('install_btn')}
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 hover:bg-indigo-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Body with Desktop Sidebar + Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenTransactionModal={() => handleOpenNewTransaction('expense')}
        />

        {/* Dynamic Views Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto max-w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenTransactionModal={(type) => handleOpenNewTransaction(type || 'expense')}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenTransactionModal={(type, tx) => handleOpenNewTransaction(type || 'expense', tx)}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'budgets' && <BudgetsView />}

          {activeTab === 'members' && <MembersView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTransactionModal={() => handleOpenNewTransaction('expense')}
      />

      {/* Global Modals */}
      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        initialType={transactionModalType}
        editingTransaction={editingTransaction}
      />

      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} />

      <WorkspaceModal
        isOpen={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
      />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
