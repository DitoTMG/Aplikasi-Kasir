import React, { useState } from 'react';
import { Camera, X, Scan, Check } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose, onScanSuccess, products }) {
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState(null);

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processBarcode(manualCode.trim());
  };

  const processBarcode = (skuCode) => {
    const found = products.find(p => p.sku === skuCode || p.sku.includes(skuCode));
    if (found) {
      setScanStatus({ type: 'success', message: `Barang Ditemukan: ${found.name}` });
      setTimeout(() => {
        onScanSuccess(found);
        setScanStatus(null);
        setManualCode('');
        onClose();
      }, 600);
    } else {
      setScanStatus({ type: 'error', message: `Barang dengan kode barcode '${skuCode}' tidak ditemukan.` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-900 dark:text-white shadow-2xl relative transition-colors">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
            <Scan className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Scan Barcode Produk</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gunakan scanner fisik atau input kode barcode SKU</p>
          </div>
        </div>

        {/* Viewfinder simulation */}
        <div className="relative bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-indigo-500/50 rounded-xl h-44 flex flex-col items-center justify-center overflow-hidden my-4">
          <div className="absolute inset-x-8 top-1/2 h-0.5 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,1)] animate-pulse" />
          <Camera className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center px-4">
            Arahkan scanner fisik USB/Bluetooth atau gunakan kamera ke barcode barang
          </p>
        </div>

        {/* Quick Demo Scan Shortcuts */}
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Klik cepat untuk tes barcode:</p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {products.slice(0, 5).map(p => (
              <button
                key={p.id}
                onClick={() => processBarcode(p.sku)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                {p.name.slice(0, 15)} ({p.sku})
              </button>
            ))}
          </div>
        </div>

        {/* Manual Barcode Input Form */}
        <form onSubmit={handleManualSubmit} className="flex space-x-2">
          <input
            type="text"
            placeholder="Masukkan SKU / Kode Barcode..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Cari
          </button>
        </form>

        {/* Scan Status Alert */}
        {scanStatus && (
          <div className={`mt-3 p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
            scanStatus.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
          }`}>
            {scanStatus.type === 'success' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            <span>{scanStatus.message}</span>
          </div>
        )}

      </div>
    </div>
  );
}

