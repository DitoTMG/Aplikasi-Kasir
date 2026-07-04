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
  ArrowRight,
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginView({ onLoginSuccess, theme }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: string }

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    // Block if Supabase is not configured
    if (!isSupabaseConfigured()) {
      setMessage({
        type: 'error',
        text: 'Supabase belum dikonfigurasi. Pastikan file .env berisi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY yang valid.'
      });
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        // Validate password strength
        if (password.length < 6) {
          throw new Error('Password minimal 6 karakter.');
        }

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

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setMessage({
            type: 'success',
            text: 'Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi akun, lalu login.'
          });
          setMode('login');
        } else if (data.session) {
          // Auto-confirmed (Supabase setting), fetch profile and login
          const profile = await fetchUserProfile(data.user.id);
          onLoginSuccess({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
            role: profile?.role || 'kasir'
          });
        }
      } else {
        // Login with email + password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        const user = data.user;
        const profile = await fetchUserProfile(user.id);
        
        onLoginSuccess({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          role: profile?.role || 'kasir'
        });
      }
    } catch (err) {
      let errorMessage = err.message || 'Gagal autentikasi ke Supabase';
      
      // Translate common Supabase errors
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email atau password salah. Silakan coba lagi.';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Email belum dikonfirmasi. Silakan cek inbox email Anda.';
      } else if (err.message?.includes('User already registered')) {
        errorMessage = 'Email sudah terdaftar. Silakan login atau gunakan email lain.';
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setMessage({ type: 'error', text: 'Supabase belum dikonfigurasi.' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Link reset password telah dikirim ke email Anda. Silakan cek inbox.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Gagal mengirim link reset password.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('Could not fetch profile:', error.message);
        return null;
      }
      return data;
    } catch {
      return null;
    }
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
            <span className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 uppercase">
              Production
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Masuk ke Sistem Kasir & Manajemen Toko Pro
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
          
          {/* Supabase Not Configured Warning */}
          {!isSupabaseConfigured() && (
            <div className="p-3.5 rounded-xl text-xs flex items-start space-x-2 font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>Supabase belum dikonfigurasi. Isi file <code className="bg-amber-100 dark:bg-amber-500/20 px-1 rounded">.env</code> dengan URL dan Anon Key dari Supabase Dashboard.</span>
            </div>
          )}

          {/* Forgot Password Mode */}
          {mode === 'forgot' ? (
            <>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setMessage(null); }}
                  className="flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Login</span>
                </button>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Reset Password</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Masukkan email Anda untuk menerima link reset password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Terdaftar
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Mengirim Link Reset...</span>
                  ) : (
                    <>
                      <span>Kirim Link Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Mode Switcher Tabs (Login / Register) */}
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

              {/* Registration Info */}
              {mode === 'register' && (
                <div className="p-3 rounded-xl text-xs flex items-start space-x-2 font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>User pertama yang mendaftar akan otomatis menjadi <strong>Owner (Pemilik Toko)</strong>. User berikutnya akan mendapat peran <strong>Kasir</strong>.</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Budi Santoso"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
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
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
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
                  {mode === 'register' && (
                    <p className="text-[10px] text-slate-400 mt-1">Minimal 6 karakter</p>
                  )}
                </div>

                {/* Forgot Password Link */}
                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setMessage(null); }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                    >
                      Lupa Password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !isSupabaseConfigured()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Memproses...</span>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Masuk Ke Kasir' : 'Buat Akun Baru'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            </>
          )}

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

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          Dilindungi oleh Supabase Auth · Data terenkripsi end-to-end
        </div>

      </div>
    </div>
  );
}
