import React from 'react';
import { X, Wifi, Copy } from 'lucide-react';

export default function LocalNetworkGuideModal({ isOpen, onClose, localIp }) {
  if (!isOpen) return null;

  const fullUrl = `http://${localIp || '192.168.1.10:3000'}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    alert(`URL disalin: ${fullUrl}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl relative my-8 transition-colors">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Panduan Koneksi Wi-Fi Lokal (Offline)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hubungkan HP ke Tablet / Laptop tanpa kuota internet</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl space-y-4 mb-4">
          
          {/* Step 1 */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Sambungkan Ke Wi-Fi Toko Yang Sama</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Pastikan Tablet Kasir dan Smartphone Anda terhubung ke jaringan Wi-Fi router lokal toko yang sama (tidak butuh kuota internet).</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Buka Browser di Smartphone</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Buka Chrome atau Safari di Smartphone HP Anda, lalu ketikkan alamat IP Server Lokal berikut:</p>
              
              <div className="mt-2 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>{fullUrl}</span>
                <button 
                  onClick={copyUrl}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
                  title="Salin Alamat"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Install Sebagai Aplikasi (PWA)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Klik menu browser "Tambahkan ke Layar Utama" / "Install App" agar aplikasi kasir memiliki ikon di HP Anda.</p>
            </div>
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer"
        >
          Mengerti, Tutup Panduan
        </button>

      </div>
    </div>
  );
}

