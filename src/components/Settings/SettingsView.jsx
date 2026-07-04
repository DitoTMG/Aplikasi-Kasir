import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Wifi, 
  Download, 
  Upload, 
  Save, 
  Database, 
  HelpCircle,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import LocalNetworkGuideModal from './LocalNetworkGuideModal';
import { db } from '../../db/dexieDb';

export default function SettingsView({ storeSettings, onSaveSettings, theme, setTheme }) {
  const [formData, setFormData] = useState({
    storeName: storeSettings?.storeName || 'Toko Berkah Utama',
    storeAddress: storeSettings?.storeAddress || 'Jl. Raya Merdeka No. 88, Jakarta',
    storePhone: storeSettings?.storePhone || '0812-3456-7890',
    receiptFooter: storeSettings?.receiptFooter || 'Terima Kasih Atas Kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan.',
    localServerIp: storeSettings?.localServerIp || '192.168.1.10:3000'
  });

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveStatus('Pengaturan berhasil disimpan!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Export JSON Backup of full database
  const handleExportBackup = async () => {
    const products = await db.products.toArray();
    const transactions = await db.transactions.toArray();
    const categories = await db.categories.toArray();
    const settings = await db.settings.toArray();

    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      transactions,
      categories,
      settings
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_QasirToko_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // Import JSON Backup
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.products) {
          await db.products.clear();
          await db.products.bulkAdd(parsed.products);
        }
        if (parsed.transactions) {
          await db.transactions.clear();
          await db.transactions.bulkAdd(parsed.transactions);
        }
        alert('Restore backup berhasil! Silakan refresh aplikasi.');
        window.location.reload();
      } catch (err) {
        alert('File backup tidak valid: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1500px] mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
            <Settings className="w-4 h-4" />
          </div>
          <span>Pengaturan Toko & Koneksi Sync</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Atur profil toko pada struk, IP Wi-Fi lokal, dan cadangan data</p>
      </div>

      <div className="max-w-4xl space-y-6">


        {/* Supabase Cloud & MCP Connection Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-white space-y-4 shadow-xs transition-colors">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Koneksi Supabase Cloud & MCP Database</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pengaturan URL & API Key untuk sinkronisasi database cloud dan MCP Server</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <p className="font-bold text-slate-700 dark:text-slate-300">📌 Di mana menemukan URL & Key di Supabase Dashboard?</p>
            <ol className="list-decimal list-inside text-slate-600 dark:text-slate-400 space-y-1">
              <li>Buka <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold underline">Supabase Dashboard</a></li>
              <li>Klik ikon roda gigi ⚙️ <b>Project Settings</b> di bilah navigasi kiri bawah.</li>
              <li>Pilih menu <b>API Settings</b>.</li>
              <li>Salin <b>Project URL</b> dan <b>service_role secret key</b>.</li>
            </ol>
          </div>
        </div>

        {/* Main Settings Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-white space-y-5 shadow-xs transition-colors">
          
          <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-extrabold text-base">Profil Toko Pada Struk Thermal</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Toko</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap Toko</label>
            <input
              type="text"
              value={formData.storeAddress}
              onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon Toko / WhatsApp</label>
            <input
              type="text"
              value={formData.storePhone}
              onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pesan Catatan Kaki Struk (Footer)</label>
            <textarea
              rows="3"
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveStatus && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{saveStatus}</span>
            )}
            <button
              type="submit"
              className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

        </form>

        {/* Wi-Fi Local Server Guide Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-white space-y-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-extrabold text-base">Koneksi Wi-Fi Lokal (Multi Device Sync)</h3>
            </div>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 font-semibold cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Cara Hubungkan HP</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gunakan alamat IP ini di browser Smartphone Anda saat terhubung ke jaringan Wi-Fi toko yang sama:
          </p>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={formData.localServerIp}
              onChange={(e) => setFormData({ ...formData, localServerIp: e.target.value })}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={() => setIsGuideOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 text-xs rounded-xl transition cursor-pointer"
            >
              Buka Panduan
            </button>
          </div>
        </div>

        {/* Backup & Restore Data Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-white space-y-4 shadow-xs transition-colors">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Database className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-base">Backup & Restore Database Lokal</h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Amankan seluruh data produk, transaksi, dan stok barang toko Anda ke dalam file cadangan `.json`.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <button
              onClick={handleExportBackup}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold p-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Download Backup (.json)</span>
            </button>

            <label className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold p-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Restore Dari File (.json)</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportBackup} 
                className="hidden" 
              />
            </label>

          </div>
        </div>
      </div>

      {/* Guide Modal */}
      <LocalNetworkGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        localIp={formData.localServerIp}
      />

    </div>
  );
}

