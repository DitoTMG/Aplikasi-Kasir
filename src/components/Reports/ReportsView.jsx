import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  FileSpreadsheet, 
  FileText,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { exportService } from '../../services/exportService';

export default function ReportsView({ transactions, products, storeSettings }) {
  const [dateRange, setDateRange] = useState('all'); // 'today', 'this_month', 'all'

  // Filter transactions by date
  const filteredTransactions = transactions.filter(t => {
    if (dateRange === 'all') return true;
    const txDate = new Date(t.date);
    const now = new Date();

    if (dateRange === 'today') {
      return txDate.toDateString() === now.toDateString();
    }
    if (dateRange === 'this_month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Calculate financial stats
  const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  
  // Calculate Net Profit (Total Sales Price - Total Cost Price of Items Sold)
  const totalCost = filteredTransactions.reduce((sum, t) => {
    const itemCost = t.items.reduce((costSum, item) => costSum + ((item.buyPrice || 0) * item.qty), 0);
    return sum + itemCost;
  }, 0);
  
  const netProfit = Math.max(0, totalSales - totalCost);
  const transactionCount = filteredTransactions.length;
  const avgBasket = transactionCount > 0 ? Math.round(totalSales / transactionCount) : 0;

  // Best Selling Items calculation
  const itemSalesMap = {};
  filteredTransactions.forEach(t => {
    t.items.forEach(item => {
      if (!itemSalesMap[item.name]) {
        itemSalesMap[item.name] = { name: item.name, qty: 0, totalRevenue: 0 };
      }
      itemSalesMap[item.name].qty += item.qty;
      itemSalesMap[item.name].totalRevenue += item.subtotal;
    });
  });

  const bestSellers = Object.values(itemSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const handleExportExcel = () => {
    exportService.exportToExcel(filteredTransactions, dateRange);
  };

  const handleExportPDF = () => {
    exportService.exportToPDF(
      filteredTransactions,
      { totalSales, netProfit, transactionCount },
      storeSettings,
      dateRange === 'today' ? 'Hari Ini' : dateRange === 'this_month' ? 'Bulan Ini' : 'Keseluruhan'
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1500px] mx-auto space-y-6">
      
      {/* Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span>Laporan Financial & Keuntungan</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Analisis omset penjualan, estimasi laba bersih, dan produk terlaris</p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5 rounded-2xl shadow-xs">
          <button
            onClick={() => setDateRange('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              dateRange === 'today' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDateRange('this_month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              dateRange === 'this_month' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              dateRange === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Omset Penjualan</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
            Rp {totalSales.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>{transactionCount} transaksi terproses</span>
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Keuntungan Bersih</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 tabular-nums">
            Rp {netProfit.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Margin dari harga jual vs modal
          </p>
        </div>

        {/* Transaction Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jumlah Transaksi</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
            {transactionCount} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Nota</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Total struk tercetak
          </p>
        </div>

        {/* Average Basket */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rata-rata / Transaksi</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-2 tabular-nums">
            Rp {avgBasket.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Rata-rata belanja per nota
          </p>
        </div>

      </div>

      {/* Export Toolbar Buttons */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-white">Ekspor Laporan Penjualan:</span> Unduh data transaksi lengkap ke format Excel atau PDF untuk pembukuan toko.
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor PDF Struk</span>
          </button>
        </div>
      </div>

      {/* Top 5 Best Selling Items Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-slate-900 dark:text-white transition-colors">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-base">Top 5 Produk Terlaris (Best Seller)</h3>
        </div>

        {bestSellers.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
            Belum ada transaksi penjualan terekam.
          </div>
        ) : (
          <div className="space-y-2.5">
            {bestSellers.map((item, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{item.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.qty} item terjual</span>
                  </div>
                </div>

                <div className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 tabular-nums">
                  Rp {item.totalRevenue.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

