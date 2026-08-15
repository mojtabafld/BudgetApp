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
import { IOSInstallGuide } from './components/IOSInstallGuide';
import { OnboardingSlider } from './components/OnboardingSlider';
import { AuthScreen } from './components/AuthScreen';
import type { Transaction, TransactionType } from './types';
import { Download, X, Smartphone } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    t,
    language,
    hasSeenOnboarding,
    completeOnboarding,
    isAuthenticated,
  } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [iosGuideOpen, setIosGuideOpen] = useState(false);

  // PWA Install prompt
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Check if already in standalone mode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

    setIsIOS(isIosDevice);

    if (isIosDevice && !isStandalone) {
      setShowInstallBanner(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setIosGuideOpen(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setIosGuideOpen(true);
    }
  };

  const handleOpenNewTransaction = (type: TransactionType = 'expense', editTx?: Transaction) => {
    setTransactionModalType(type);
    setEditingTransaction(editTx || null);
    setTransactionModalOpen(true);
  };

  // 1. Show 3-Slide Telegram-like Onboarding for first time visitors
  if (!hasSeenOnboarding) {
    return <OnboardingSlider onComplete={completeOnboarding} />;
  }

  // 2. Show Login / Register Screen if not authenticated (stays logged in until logout)
  if (!isAuthenticated) {
    return <AuthScreen onSuccess={() => {}} />;
  }

  // 3. Main Dashboard Application
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenShareModal={() => setShareModalOpen(true)}
        onOpenWorkspaceModal={() => setWorkspaceModalOpen(true)}
      />

      {/* PWA / iOS Install Notification Banner */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 text-white px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between shadow-lg animate-in slide-in-from-top">
          <div className="flex items-center gap-2 truncate">
            {isIOS ? <Smartphone className="w-4 h-4 shrink-0 text-emerald-300" /> : <Download className="w-4 h-4 shrink-0" />}
            <span className="font-semibold truncate">
              {isIOS
                ? language === 'fa'
                  ? 'افزودن BudgetMaster به صفحه اصلی آیفون (مانند اپ بومی iOS)'
                  : 'Install BudgetMaster on iPhone Home Screen (iOS Native App)'
                : t('install_desc')}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1 bg-white text-indigo-700 font-bold rounded-xl hover:bg-slate-100 shadow-sm transition-all active:scale-95 text-xs"
            >
              {isIOS ? (language === 'fa' ? 'راهنما و نصب' : 'Install (iOS)') : t('install_btn')}
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
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
          onOpenInstallGuide={() => setIosGuideOpen(true)}
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

      <IOSInstallGuide isOpen={iosGuideOpen} onClose={() => setIosGuideOpen(false)} />
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
