import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  BarChart3, 
  Settings, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Tablet, 
  Smartphone,
  Store,
  Sun,
  Moon,
  LogOut,
  User
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isOnline, 
  setIsOnline, 
  pendingSyncCount, 
  onSyncNow,
  isSyncing,
  deviceMode,
  setDeviceMode,
  storeName,
  theme,
  setTheme,
  currentUser,
  onLogout
}) {
  const navItems = [
    { id: 'pos', label: 'Kasir (POS)', icon: ShoppingCart },
    { id: 'inventory', label: 'Stok Produk', icon: Package },
    { id: 'transactions', label: 'Riwayat Struk', icon: FileText },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      theme === 'light' 
        ? 'bg-white/90 border-slate-200/80 text-slate-900 shadow-xs' 
        : 'bg-slate-950/90 border-slate-800/80 text-slate-100'
    }`}>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 flex items-center justify-center shadow-xs ring-1 ring-white/10">
              <Store className="w-5 h-5 text-indigo-400 dark:text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-base font-extrabold tracking-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {storeName || 'QasirToko'}
                </h1>
                <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5 tracking-wide uppercase bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30">
                  POS PRO
                </Badge>
              </div>
              <p className={`text-xs hidden sm:block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Sistem Kasir & Operasional Toko
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className={`hidden md:flex items-center space-x-1 p-1 rounded-xl border ${
            theme === 'light' ? 'bg-slate-100/80 border-slate-200/80' : 'bg-slate-900/80 border-slate-800/80'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? theme === 'light'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'bg-slate-800 text-white shadow-xs'
                      : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (theme === 'light' ? 'text-indigo-600' : 'text-indigo-400') : 'opacity-70'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Connection Status, Device Mode, Theme Toggle */}
          <div className="flex items-center space-x-2">
            
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={`Ubah ke ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="h-9 w-9 rounded-lg"
            >
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </Button>

            {/* Device Mode Toggle */}
            <div className={`hidden sm:flex items-center rounded-lg p-0.5 border ${
              theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`h-8 px-2.5 rounded-md text-xs font-medium flex items-center transition-colors cursor-pointer ${
                  deviceMode === 'tablet' 
                    ? (theme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'bg-slate-800 text-white')
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tablet className="w-3.5 h-3.5 mr-1" />
                <span className="hidden lg:inline">Tablet</span>
              </button>
              <button
                onClick={() => setDeviceMode('smartphone')}
                className={`h-8 px-2.5 rounded-md text-xs font-medium flex items-center transition-colors cursor-pointer ${
                  deviceMode === 'smartphone' 
                    ? (theme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'bg-slate-800 text-white')
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 mr-1" />
                <span className="hidden lg:inline">HP</span>
              </button>
            </div>

            {/* Online / Offline Connection Switcher */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center border transition-colors cursor-pointer ${
                isOnline 
                  ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' 
                  : 'border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-500 mr-1.5" />
                  <span className="hidden sm:inline">ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                  <span className="hidden sm:inline">OFFLINE</span>
                </>
              )}
            </button>

            {/* Manual Sync Button with Badge */}
            <Button
              variant={pendingSyncCount > 0 ? 'default' : 'outline'}
              size="sm"
              onClick={onSyncNow}
              disabled={isSyncing || !isOnline}
              className="relative h-9 px-3 text-xs rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''} sm:mr-1.5`} />
              <span className="hidden sm:inline">Sync</span>
              {pendingSyncCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {pendingSyncCount}
                </span>
              )}
            </Button>

            {/* Active User Badge & Logout Button */}
            {currentUser && (
              <div className="flex items-center space-x-1 pl-1 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.name?.[0]?.toUpperCase() || 'K'}
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold text-slate-900 dark:text-white max-w-[100px] truncate">{currentUser.name}</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">{currentUser.role}</div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  title="Keluar / Logout Akun"
                  className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md border-t z-50 px-2 py-1.5 flex items-center justify-around text-xs transition-colors ${
        theme === 'light' ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-950/95 border-slate-800 text-slate-200'
      }`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {/* Mobile Dedicated Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-medium transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
          title="Ganti Tema Mode (Terang / Gelap)"
        >
          {theme === 'light' ? (
            <Sun className="w-5 h-5 mb-0.5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 mb-0.5 text-indigo-400" />
          )}
          <span>Tema</span>
        </button>
      </div>
    </header>
  );
}


