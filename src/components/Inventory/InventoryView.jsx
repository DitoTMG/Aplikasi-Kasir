import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  FolderPlus
} from 'lucide-react';
import ProductModal from './ProductModal';
import CategoryManagementModal from './CategoryManagementModal';

export default function InventoryView({ products, categories, onAddProduct, onUpdateProduct, onDeleteProduct }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'out'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Filter logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.includes(searchQuery);
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = p.stock > 0 && p.stock <= p.minStock;
    if (stockFilter === 'out') matchesStock = p.stock <= 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (productData) => {
    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, productData);
    } else {
      await onAddProduct(productData);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1500px] mx-auto space-y-6">
      
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
              <Package className="w-4 h-4" />
            </div>
            <span>Manajemen Stok & Produk</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kelola katalog barang, kategori custom, ubah harga, dan pantau ketersediaan stok</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Custom Category Button */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 transition cursor-pointer shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Kelola Kategori</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={handleCreateClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* Stock Health Badges Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div 
          onClick={() => setStockFilter('all')}
          className={`cursor-pointer bg-white dark:bg-slate-900 border rounded-2xl p-4 transition shadow-xs ${
            stockFilter === 'all' ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Item Produk</span>
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 tabular-nums">
            {products.length} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">SKU</span>
          </div>
        </div>

        <div 
          onClick={() => setStockFilter('low')}
          className={`cursor-pointer bg-white dark:bg-slate-900 border rounded-2xl p-4 transition shadow-xs ${
            stockFilter === 'low' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">Stok Menipis</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1.5 tabular-nums">
            {lowStockCount} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Barang</span>
          </div>
        </div>

        <div 
          onClick={() => setStockFilter('out')}
          className={`cursor-pointer bg-white dark:bg-slate-900 border rounded-2xl p-4 transition shadow-xs ${
            stockFilter === 'out' ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider">Stok Habis</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-1.5 tabular-nums">
            {outOfStockCount} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Barang</span>
          </div>
        </div>

      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari barang berdasarkan nama atau kode SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Inventory Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Nama Barang</th>
                <th className="py-3.5 px-4">SKU / Barcode</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Harga Modal</th>
                <th className="py-3.5 px-4">Harga Jual</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                    Tidak ada data barang yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= p.minStock;
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Satuan: {p.unit}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-indigo-300">{p.sku}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-semibold">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                        Rp {p.buyPrice?.toLocaleString('id-ID') || 0}
                      </td>

                      <td className="py-3 px-4 font-extrabold text-indigo-600 dark:text-emerald-400 tabular-nums">
                        Rp {p.sellPrice?.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 px-2 py-0.5 rounded-md font-bold">
                            Habis (0)
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                            {p.stock} {p.unit}
                          </span>
                        ) : (
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md font-semibold">
                            {p.stock} {p.unit}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-600/30 rounded-lg transition cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        product={editingProduct}
        categories={categories}
      />

      {/* Category Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
      />

    </div>
  );
}

