import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialData } from './db/dexieDb';
import { syncService } from './services/syncService';
import Navbar from './components/Navbar';
import CashierView from './components/POS/CashierView';
import InventoryView from './components/Inventory/InventoryView';
import TransactionsView from './components/Transactions/TransactionsView';
import ReportsView from './components/Reports/ReportsView';
import LoginView from './components/Auth/LoginView';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { supabase } from './lib/supabaseClient';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deviceMode, setDeviceMode] = useState('tablet'); // 'tablet' | 'smartphone'
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'

  // User Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('qasir_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Dexie Live Queries
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const transactions = useLiveQuery(() => db.transactions.orderBy('id').reverse().toArray(), []) || [];
  const settingsArray = useLiveQuery(() => db.settings.toArray(), []) || [];

  // Convert settings array to object
  const storeSettings = settingsArray.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  // Pending sync items count
  const pendingSyncCount = transactions.filter(t => t.syncStatus === 'MENUNGGU_SYNC').length;

  // Check Supabase Auth Session
  useEffect(() => {
    seedInitialData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          role: 'Kasir Supabase'
        };
        setCurrentUser(u);
        localStorage.setItem('qasir_user', JSON.stringify(u));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          role: 'Kasir Supabase'
        };
        setCurrentUser(u);
        localStorage.setItem('qasir_user', JSON.stringify(u));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('qasir_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('qasir_user');
  };


  // Update body theme class when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark', 'theme-dark');
      document.body.classList.remove('theme-light', 'light');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark', 'theme-dark');
      document.body.classList.add('theme-light', 'light');
    }
  }, [theme]);


  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSyncNow();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Manual or Auto Sync
  const handleSyncNow = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    const result = await syncService.syncPendingData();
    setIsSyncing(false);
    if (result.count > 0) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.2 } });
    }
  };

  // Add / Save Transaction & Deduct Stock
  const handleSaveTransaction = async (checkoutData) => {
    const nextReceiptNum = transactions.length + 1;
    const receiptNo = `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(nextReceiptNum).padStart(3, '0')}`;

    const newTx = {
      receiptNo,
      date: new Date().toISOString(),
      items: checkoutData.items,
      subtotal: checkoutData.subtotal,
      discount: checkoutData.discount,
      tax: 0,
      total: checkoutData.total,
      payAmount: checkoutData.payAmount,
      changeAmount: checkoutData.changeAmount,
      paymentMethod: checkoutData.paymentMethod,
      status: 'SELESAI',
      syncStatus: isOnline ? 'TERSYNC' : 'MENUNGGU_SYNC',
      createdAt: new Date().toISOString()
    };

    // Add to DB
    const txId = await db.transactions.add(newTx);
    const savedTx = { ...newTx, id: txId };

    // Automatically reduce product stocks
    for (const item of checkoutData.items) {
      const product = await db.products.get(item.id);
      if (product) {
        const newStock = Math.max(0, product.stock - item.qty);
        await db.products.update(item.id, { stock: newStock });
      }
    }

    // Trigger celebration effect
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    return savedTx;
  };

  // Product CRUD
  const handleAddProduct = async (productData) => {
    await db.products.add(productData);
  };

  const handleUpdateProduct = async (id, productData) => {
    await db.products.update(id, productData);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Yakin ingin menghapus produk ini dari daftar stok?')) {
      await db.products.delete(id);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id) => {
    if (confirm('Yakin ingin menghapus riwayat transaksi ini?')) {
      await db.transactions.delete(id);
    }
  };

  // Save Settings
  const handleSaveSettings = async (newSettingsObj) => {
    for (const [key, value] of Object.entries(newSettingsObj)) {
      await db.settings.put({ key, value });
    }
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} theme={theme} />;
  }

  return (
    <div className="min-h-screen font-sans pb-16 md:pb-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">

      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        pendingSyncCount={pendingSyncCount}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        storeName={storeSettings.storeName}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />


      {/* Main Active Tab Content View */}
      <main className="transition-all duration-300">
        {activeTab === 'pos' && (
          <CashierView
            products={products}
            categories={categories}
            onSaveTransaction={handleSaveTransaction}
            storeSettings={storeSettings}
            deviceMode={deviceMode}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            categories={categories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            storeSettings={storeSettings}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            products={products}
            storeSettings={storeSettings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            storeSettings={storeSettings}
            onSaveSettings={handleSaveSettings}
            theme={theme}
            setTheme={setTheme}
          />
        )}
      </main>

      {/* Floating PWA Install Banner Prompt */}
      <PWAInstallPrompt />

    </div>
  );
}
