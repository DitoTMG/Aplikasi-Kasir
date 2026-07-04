import React from 'react';
import { X, Smartphone, Download, CheckCircle2, Share, MoreVertical, PlusSquare } from 'lucide-react';

export default function AndroidDownloadModal({ isOpen, onClose, onInstallPwa, canInstallPwa }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 transition-colors">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Install QasirToko di Android</span>
              <span className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                PWA App
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Jadikan aplikasi kasir mandiri tanpa perlu buka browser</p>
          </div>
        </div>

        {/* Direct PWA Install Button if available */}
        {canInstallPwa && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 space-y-2">
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">✨ Perangkat Anda mendukung instalasi langsung:</p>
            <button
              onClick={() => {
                onInstallPwa();
                onClose();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Klik Untuk Install Aplikasi Sekarang</span>
            </button>
          </div>
        )}

        {/* Step by Step Manual Guide for Android Chrome / Browsers */}
        <div className="space-y-4 text-xs">
          <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            Cara Pasang di HP Android (Google Chrome / Browser):
          </p>

          <div className="space-y-3">
            
            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Buka Menu Browser Chrome</p>
                <p className="text-slate-500 dark:text-slate-400">Tekan tombol titik tiga <MoreVertical className="w-3.5 h-3.5 inline text-indigo-500" /> di pojok kanan atas browser HP Android Anda.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Pilih "Tambahkan ke Layar Utama" / "Install App"</p>
                <p className="text-slate-500 dark:text-slate-400">Pilih opsi <PlusSquare className="w-3.5 h-3.5 inline text-indigo-500" /> <strong>"Tambahkan ke Layar Utama"</strong> (Add to Home Screen) atau <strong>"Install Aplikasi"</strong>.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Konfirmasi Instalasi</p>
                <p className="text-slate-500 dark:text-slate-400">Tekan tombol <strong>"Install"</strong> atau <strong>"Tambah"</strong>. Ikon QasirToko akan langsung muncul di layar utama HP Android Anda layaknya aplikasi Play Store!</p>
              </div>
            </div>

          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-[11px]">Aplikasi PWA menggunakan penyimpanan hemat & mendukung mode offline penuh!</span>
          </div>
        </div>

      </div>
    </div>
  );
}
