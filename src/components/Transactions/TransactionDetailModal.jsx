import React from 'react';
import { X, Printer, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function TransactionDetailModal({ isOpen, onClose, transaction, storeSettings }) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 shadow-2xl relative my-8 transition-colors">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Detail Struk Transaksi</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{transaction.receiptNo}</p>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="mb-4">
          {transaction.syncStatus === 'TERSYNC' ? (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tersinkronisasi ke Cloud</span>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-2 font-semibold">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Disimpan Lokal (Menunggu Sync Auto)</span>
            </div>
          )}
        </div>

        {/* Paper Struk Box */}
        <div className="bg-white text-slate-900 p-5 rounded-xl font-mono text-xs shadow-inner border border-slate-200 mb-6">
          <div className="text-center border-b border-dashed border-slate-300 pb-2 mb-2">
            <div className="font-extrabold text-sm uppercase">{storeSettings?.storeName || 'TOKO BERKAH'}</div>
            <div className="text-[10px] text-slate-500">{storeSettings?.storeAddress}</div>
          </div>

          <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2 mb-2 text-slate-600">
            <div className="flex justify-between">
              <span>No Struk:</span>
              <span className="font-bold text-slate-900">{transaction.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{new Date(transaction.date).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Metode:</span>
              <span className="font-semibold uppercase">{transaction.paymentMethod}</span>
            </div>
          </div>

          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2 mb-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span>{item.name} ({item.qty}x)</span>
                <span className="font-bold tabular-nums">Rp {item.subtotal.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>

          <div className="space-y-0.5 text-slate-800">
            <div className="flex justify-between font-extrabold text-sm text-slate-900">
              <span>TOTAL:</span>
              <span className="tabular-nums">Rp {transaction.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>Bayar:</span>
              <span className="tabular-nums">Rp {transaction.payAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[10px] text-emerald-700 font-semibold">
              <span>Kembali:</span>
              <span className="tabular-nums">Rp {transaction.changeAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePrint}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Ulang Struk</span>
        </button>

      </div>
    </div>
  );
}

