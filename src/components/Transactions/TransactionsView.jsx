import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Trash2
} from 'lucide-react';
import TransactionDetailModal from './TransactionDetailModal';

export default function TransactionsView({ transactions, onDeleteTransaction, storeSettings }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredTx = transactions.filter(t => {
    const matchesSearch = t.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPayment = paymentFilter === 'ALL' || t.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const totalOmset = filteredTx.reduce((sum, t) => sum + t.total, 0);

  const handleOpenDetail = (tx) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1500px] mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <span>Riwayat Struk Transaksi</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Daftar seluruh transaksi yang telah terjadi di toko Anda</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-2xl flex items-center space-x-3 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Omset Filter:</span>
          <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">Rp {totalOmset.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Search & Payment Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor struk atau nama barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'Tunai', 'QRIS', 'Transfer'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentFilter(method)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition cursor-pointer ${
                  paymentFilter === method
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {method === 'ALL' ? 'Semua Metode' : method === 'Transfer' ? 'Debit/TF' : method}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Transactions List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">No Struk</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Barang Belanja</th>
                <th className="py-3.5 px-4">Metode</th>
                <th className="py-3.5 px-4">Total Penjualan</th>
                <th className="py-3.5 px-4 text-center">Status Sync</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                    Belum ada riwayat transaksi penjualan.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {tx.receiptNo}
                    </td>

                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 tabular-nums">
                      {new Date(tx.date).toLocaleDateString('id-ID')} {' '}
                      <span className="text-slate-400 dark:text-slate-500">
                        {new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-200 line-clamp-1 max-w-[200px]">
                        {tx.items.map(i => `${i.name} (${i.qty}x)`).join(', ')}
                      </div>
                      <div className="text-[10px] text-slate-400">{tx.items.length} jenis item</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px]">
                        {tx.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-extrabold text-indigo-600 dark:text-indigo-400 text-sm tabular-nums">
                      Rp {tx.total.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {tx.syncStatus === 'TERSYNC' ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>TERSYNC</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <Clock className="w-3 h-3" />
                          <span>MENUNGGU</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenDetail(tx)}
                          className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-600/30 rounded-lg transition cursor-pointer"
                          title="Lihat Detail Struk"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        transaction={selectedTx}
        storeSettings={storeSettings}
      />

    </div>
  );
}

