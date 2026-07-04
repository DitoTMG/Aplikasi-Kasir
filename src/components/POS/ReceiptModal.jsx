import React, { useRef } from 'react';
import { Printer, Share2, CheckCircle2, X } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, transaction, storeSettings }) {
  const receiptRef = useRef();

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*NOTA STRUK PENJUALAN*\n${storeSettings.storeName || 'TOKO BERKAH'}\nNo: ${transaction.receiptNo}\nTanggal: ${new Date(transaction.date).toLocaleString('id-ID')}\n----------------------------\n${transaction.items.map(i => `${i.name} (${i.qty}x) = Rp${i.subtotal.toLocaleString('id-ID')}`).join('\n')}\n----------------------------\n*TOTAL: Rp${transaction.total.toLocaleString('id-ID')}*\nBayar: Rp${transaction.payAmount.toLocaleString('id-ID')}\nKembali: Rp${transaction.changeAmount.toLocaleString('id-ID')}\n\nTerima kasih telah berbelanja!`;
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
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

        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Transaksi Berhasil!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Kembalian: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-base tabular-nums">Rp {transaction.changeAmount.toLocaleString('id-ID')}</span></p>
        </div>

        {/* Thermal Receipt Preview Paper */}
        <div 
          ref={receiptRef}
          className="bg-white text-slate-900 p-6 rounded-xl font-mono text-xs shadow-inner border border-slate-200 mx-auto max-w-[320px] print:m-0 print:p-0 print:shadow-none"
          id="thermal-receipt-paper"
        >
          {/* Receipt Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
            <div className="font-extrabold text-base text-slate-900 uppercase tracking-wide">
              {storeSettings?.storeName || 'TOKO BERKAH UTAMA'}
            </div>
            <div className="text-[10px] text-slate-600">
              {storeSettings?.storeAddress || 'Jl. Raya Merdeka No. 88'}
            </div>
            <div className="text-[10px] text-slate-600">
              Telp: {storeSettings?.storePhone || '0812-3456-7890'}
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2 mb-2 text-slate-700">
            <div className="flex justify-between">
              <span>No Struk:</span>
              <span className="font-bold">{transaction.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{new Date(transaction.date).toLocaleDateString('id-ID')} {new Date(transaction.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Metode:</span>
              <span className="font-semibold uppercase">{transaction.paymentMethod}</span>
            </div>
          </div>

          {/* Receipt Items List */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3 mb-3">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-slate-900 leading-tight">{item.name}</div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>{item.qty} x Rp {item.price.toLocaleString('id-ID')}</span>
                  <span className="font-bold text-slate-900 tabular-nums">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Receipt Financial Totals */}
          <div className="space-y-1 text-slate-800 border-b border-dashed border-slate-300 pb-3 mb-3">
            <div className="flex justify-between text-[11px]">
              <span>Subtotal:</span>
              <span className="tabular-nums">Rp {transaction.subtotal.toLocaleString('id-ID')}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-[11px] text-rose-600 font-semibold">
                <span>Diskon:</span>
                <span className="tabular-nums">-Rp {transaction.discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1">
              <span>TOTAL:</span>
              <span className="tabular-nums">Rp {transaction.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1">
              <span>Bayar ({transaction.paymentMethod}):</span>
              <span className="tabular-nums">Rp {transaction.payAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-semibold text-[11px] text-emerald-700">
              <span>Kembali:</span>
              <span className="tabular-nums">Rp {transaction.changeAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Receipt Footer Message */}
          <div className="text-center text-[9px] text-slate-500 whitespace-pre-line leading-relaxed">
            {storeSettings?.receiptFooter || 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar.'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim WA</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          Transaksi Baru
        </button>

      </div>
    </div>
  );
}

