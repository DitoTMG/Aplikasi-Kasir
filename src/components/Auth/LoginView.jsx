import React, { useState } from 'react';
import { 
  Store, 
  Lock, 
  Mail, 
  User, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginView({ onLoginSuccess, theme }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: string }

  // Custom Supabase config inputs
  const [showConfig, setShowConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [customKey, setCustomKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || 'Kasir Toko'
            }
          }
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Pendaftaran akun Supabase berhasil! Silakan cek email Anda untuk konfirmasi atau langsung login.'
        });
        setMode('login');
      } else {
        // Mode Login Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          // If Supabase credentials fails or isn't configured yet, fallback with demo or clear message
          if (!isSupabaseConfigured()) {
            setMessage({
              type: 'error',
              text: 'URL Supabase belum dikonfigurasi. Menggunakan akun demo lokal...'
            });
            setTimeout(() => {
              onLoginSuccess({
                id: 'local-user-1',
                email: email || 'kasir@toko.com',
                name: fullName || email.split('@')[0] || 'Kasir Utama',
                role: 'Pemilik Toko'
              });
            }, 800);
            return;
          }
          throw error;
        }

        const user = data.user;
        onLoginSuccess({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          role: 'Kasir Supabase'
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Gagal autentikasi ke Supabase'
      });
    } finally {
      setLoading(false);
    }
  };

  // Demo Login (Offline / Direct Kasir Mode)
  const handleDemoLogin = (roleName) => {
    onLoginSuccess({
      id: `demo-${Date.now()}`,
      email: `${roleName.toLowerCase().replace(/\s+/g, '')}@tokoberkah.com`,
      name: `${roleName} Utama`,
      role: roleName
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-500/10">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2 pt-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">QasirToko</h1>
            <span className="bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 uppercase">
              Supabase Auth
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Masuk ke Sistem Kasir & Manajemen Toko Pro
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => { setMode('login'); setMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Masuk (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('register'); setMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Daftar Akun</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Kasir / Pemilik
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required={mode === 'register'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kasir@toko.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses Auth Supabase...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk Ke Kasir' : 'Buat Akun Supabase'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Feedback Alerts */}
          {message && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start space-x-2 font-semibold ${
              message.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Quick Demo Offline Mode Switcher */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Akses Cepat Kasir (Offline / Demo):
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('Kasir')}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 px-3 rounded-xl text-xs transition border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Masuk Kasir</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('Pemilik Toko')}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 px-3 rounded-xl text-xs transition border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Masuk Owner</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          Powered by Supabase Auth & Dexie Offline IndexedDB
        </div>

      </div>
    </div>
  );
}
