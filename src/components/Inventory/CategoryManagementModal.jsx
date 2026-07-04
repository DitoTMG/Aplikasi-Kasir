import React, { useState } from 'react';
import { X, Plus, Trash2, FolderPlus, Tag } from 'lucide-react';
import { db } from '../../db/dexieDb';

export default function CategoryManagementModal({ isOpen, onClose, categories }) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const trimmed = newCategoryName.trim();
    const exists = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setErrorMsg(`Kategori '${trimmed}' sudah ada.`);
      return;
    }

    await db.categories.add({
      name: trimmed,
      icon: 'Tag'
    });

    setNewCategoryName('');
    setErrorMsg('');
  };

  const handleDeleteCategory = async (id, name) => {
    if (confirm(`Yakin ingin menghapus kategori '${name}'?`)) {
      await db.categories.delete(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative my-8 transition-colors">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Kelola Kategori Custom</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Buat kategori sesuai jenis toko Anda</p>
          </div>
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleAddCategory} className="space-y-3 mb-6">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Tambah Kategori Baru</label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Contoh: Aksesoris HP, Baju Pria..."
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setErrorMsg('');
              }}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
          {errorMsg && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{errorMsg}</p>}
        </form>

        {/* Existing Categories List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daftar Kategori ({categories.length}):</p>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm"
            >
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-slate-900 dark:text-white">{cat.name}</span>
              </div>
              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition cursor-pointer"
                title="Hapus Kategori"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}

