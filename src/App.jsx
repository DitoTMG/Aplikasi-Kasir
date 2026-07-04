import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialData } from './db/dexieDb';
import { syncService } from './services/syncService';
import Navbar from './components/Navbar';
import CashierView from './components/POS/CashierView';
import InventoryView from './components/Inventory/InventoryView';
import TransactionsView from './components/Transactions/TransactionsView';
import ReportsView from './components/Reports/ReportsView';
import SettingsView from './components/Settings/SettingsView';
import LoginView from './components/Auth/LoginView';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { supabaseService } from './services/supabaseService';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deviceMode, setDeviceMode] = useState('tablet'); // 'tablet' | 'smartphone'
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'

  // Auth State — NO localStorage, always from Supabase session
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // Fetch user profile (role) from Supabase
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.warn('Could not fetch profile:', error.message);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  };

  // Build user object from Supabase session + profile
  const buildUserFromSession = async (session) => {
    if (!session?.user) return null;

    const user = session.user;
    const profile = await fetchUserProfile(user.id);

    return {
      id: user.id,
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || user.email.split('@')[0],
      role: profile?.role || 'kasir'
    };
  };

  // Check Supabase Auth Session on mount
  useEffect(() => {
    seedInitialData();

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const userData = await buildUserFromSession(session);
        setCurrentUser(userData);
      }
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const userData = await buildUserFromSession(session);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to Realtime multi-device sync & pull cloud data when logged in & online
  useEffect(() => {
    if (currentUser && isOnline) {
      syncService.syncProductsFromCloud();
      syncService.syncTransactionsFromCloud();
      syncService.subscribeRealtime();

      // Trigger sync for any pending transactions saved while offline/error
      syncService.syncPendingData();
    } else {
      syncService.unsubscribeRealtime();
    }

    return () => {
      syncService.unsubscribeRealtime();
    };
  }, [currentUser, isOnline]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = async () => {
    syncService.unsubscribeRealtime();
    await supabase.auth.signOut();
    setCurrentUser(null);
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
      userId: currentUser?.id || null,
      status: 'SELESAI',
      syncStatus: isOnline ? 'TERSYNC' : 'MENUNGGU_SYNC',
      createdAt: new Date().toISOString()
    };

    // Add to local DB
    const txId = await db.transactions.add(newTx);
    const savedTx = { ...newTx, id: txId };

    // Automatically reduce product stocks in local DB
    for (const item of checkoutData.items) {
      const product = await db.products.get(item.id);
      if (product) {
        const newStock = Math.max(0, product.stock - item.qty);
        await db.products.update(item.id, { stock: newStock });
        if (isOnline && isSupabaseConfigured()) {
          try {
            await supabaseService.updateProduct(item.id, { ...product, stock: newStock });
          } catch (err) {
            console.warn('Syncing stock reduction to Supabase failed:', err.message);
          }
        }
      }
    }

    // Immediately push transaction to Supabase if online
    if (isOnline && isSupabaseConfigured()) {
      try {
        await supabaseService.insertTransaction(savedTx, checkoutData.items);
        await db.transactions.update(txId, { syncStatus: 'TERSYNC' });
      } catch (err) {
        console.warn('Syncing transaction to Supabase failed:', err.message);
        await db.transactions.update(txId, { syncStatus: 'MENUNGGU_SYNC' });
      }
    }

    // Trigger celebration effect
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    return savedTx;
  };

  // Product CRUD (local DB + Supabase sync)
  const handleAddProduct = async (productData) => {
    const id = await db.products.add(productData);
    if (isOnline && isSupabaseConfigured()) {
      try {
        await supabaseService.insertProduct({ ...productData, id });
      } catch (err) {
        console.warn('Syncing new product to Supabase failed:', err.message);
      }
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    await db.products.update(id, productData);
    if (isOnline && isSupabaseConfigured()) {
      try {
        await supabaseService.updateProduct(id, productData);
      } catch (err) {
        console.warn('Syncing product update to Supabase failed:', err.message);
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Yakin ingin menghapus produk ini dari daftar stok?')) {
      const itemToDelete = await db.products.get(id);
      await db.products.delete(id);

      if (isOnline && isSupabaseConfigured()) {
        try {
          await supabaseService.deleteProduct(id);
          if (itemToDelete?.sku) {
            const { error } = await supabase.from('products').delete().eq('sku', itemToDelete.sku);
            if (error) console.warn('Delete by SKU fallback:', error.message);
          }
        } catch (err) {
          console.warn('Syncing product deletion from Supabase failed:', err.message);
        }
      }
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id) => {
    if (confirm('Yakin ingin menghapus riwayat transaksi ini?')) {
      const txToDelete = await db.transactions.get(id);
      await db.transactions.delete(id);

      if (isOnline && isSupabaseConfigured() && txToDelete?.receiptNo) {
        try {
          await supabase.from('transactions').delete().eq('receipt_no', txToDelete.receiptNo);
        } catch (err) {
          console.warn('Syncing transaction deletion failed:', err.message);
        }
      }
    }
  };

  // Save Settings
  const handleSaveSettings = async (newSettingsObj) => {
    for (const [key, value] of Object.entries(newSettingsObj)) {
      await db.settings.put({ key, value });
    }
  };

  // Role-based tab access
  const userRole = currentUser?.role || 'kasir';
  const canAccessTab = (tabId) => {
    if (userRole === 'owner') return true;
    // Kasir can access POS, Transactions, and Settings (for account & sync)
    return ['pos', 'transactions', 'settings'].includes(tabId);
  };

  // Redirect kasir to allowed tab if they're on a restricted one
  useEffect(() => {
    if (currentUser && !canAccessTab(activeTab)) {
      setActiveTab('pos');
    }
  }, [currentUser, activeTab]);

  // Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 animate-pulse">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 font-semibold">Memeriksa sesi login...</p>
        </div>
      </div>
    );
  }

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
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        storeName={storeSettings.storeName}
        theme={theme}
        setTheme={setTheme}
        userRole={userRole}
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

        {activeTab === 'inventory' && canAccessTab('inventory') && (
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

        {activeTab === 'reports' && canAccessTab('reports') && (
          <ReportsView
            transactions={transactions}
            products={products}
            storeSettings={storeSettings}
          />
        )}

        {activeTab === 'settings' && canAccessTab('settings') && (
          <SettingsView
            storeSettings={storeSettings}
            onSaveSettings={handleSaveSettings}
            theme={theme}
            setTheme={setTheme}
            currentUser={currentUser}
            onLogout={handleLogout}
            userRole={userRole}
            pendingSyncCount={pendingSyncCount}
            onSyncNow={handleSyncNow}
            isSyncing={isSyncing}
            isOnline={isOnline}
          />
        )}
      </main>

      {/* Floating PWA Install Banner Prompt */}
      <PWAInstallPrompt />

    </div>
  );
}
