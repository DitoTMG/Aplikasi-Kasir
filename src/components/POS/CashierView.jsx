import React, { useState, useRef } from 'react';
import { 
  Search, 
  Scan, 
  Package, 
  Plus, 
  AlertTriangle, 
  ShoppingBag,
  ArrowDown
} from 'lucide-react';
import CartPanel from './CartPanel';
import BarcodeScannerModal from './BarcodeScannerModal';
import ReceiptModal from './ReceiptModal';

export default function CashierView({ 
  products, 
  categories, 
  onSaveTransaction, 
  storeSettings,
  deviceMode 
}) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const cartSectionRef = useRef(null);

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate totals for floating bar
  const cartTotalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.sellPrice * item.qty, 0);
  const cartTotal = Math.max(0, cartSubtotal - discount);

  // Add item to cart
  const handleAddToCart = (product) => {
    if (product.stock <= 0) return;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].qty + 1;
        if (newQty <= product.stock) {
          updated[existingIndex].qty = newQty;
        }
        return updated;
      } else {
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
  };

  // Update Cart Qty
  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && newQty > product.stock) return;

    setCart(prev => prev.map(item => item.id === productId ? { ...item, qty: newQty } : item));
  };

  // Remove Item from Cart
  const handleRemoveItem = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  // Checkout Handler
  const handleCheckout = async (checkoutData) => {
    const tx = await onSaveTransaction(checkoutData);
    setCompletedTransaction(tx);
    setIsReceiptOpen(true);
    handleClearCart();
  };

  const scrollToCart = () => {
    cartSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1500px] mx-auto space-y-5 pb-24 md:pb-6">
      
      {/* Search & Category Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari barang berdasarkan nama atau scan SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-16 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Barcode Scan Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
          >
            <Scan className="w-4 h-4 text-indigo-400 dark:text-white" />
            <span>Scan Barcode</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
              selectedCategory === 'Semua'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Semua Produk ({products.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Layout: Left Product Grid vs Right Cart Panel */}
      <div className={`grid gap-6 ${deviceMode === 'smartphone' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        
        {/* Product Cards Grid Area */}
        <div className={deviceMode === 'smartphone' ? 'col-span-1' : 'lg:col-span-7 xl:col-span-8'}>
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStock;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleAddToCart(product)}
                    className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer overflow-hidden ${
                      isOutOfStock
                        ? 'opacity-50 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60 truncate max-w-[90px]">
                        {product.category}
                      </span>
                      
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-500/30">
                          Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/30 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Stok {product.stock}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                          Stok: {product.stock}
                        </span>
                      )}
                    </div>

                    {/* SKU Code */}
                    <div className="text-[10px] font-mono text-slate-400 dark:text-indigo-400 mb-1">
                      SKU: {product.sku}
                    </div>

                    {/* Name & Pricing */}
                    <div className="my-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
                        {product.name}
                      </h4>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                          Rp {product.sellPrice.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">/{product.unit}</span>
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    {!isOutOfStock && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-indigo-400 group-hover:text-white group-hover:bg-indigo-600 py-1.5 rounded-xl transition">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>+ Tambah</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Cart Panel Area */}
        <div ref={cartSectionRef} className={deviceMode === 'smartphone' ? 'col-span-1' : 'lg:col-span-5 xl:col-span-4'}>
          <CartPanel
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            discount={discount}
            setDiscount={setDiscount}
          />
        </div>

      </div>

      {/* Floating Bottom Cart Bar for Smartphone / Mobile screens */}
      {cart.length > 0 && (
        <div className="fixed bottom-14 left-4 right-4 z-40 md:hidden animate-bounce-short">
          <div className="bg-slate-900 dark:bg-slate-900 border border-slate-700 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between backdrop-blur-md">
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center relative border border-indigo-400/40">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartTotalItems}
                </span>
              </div>
              <div>
                <div className="text-[11px] text-slate-300">{cartTotalItems} Jenis Produk</div>
                <div className="text-base font-bold text-white tabular-nums">Rp {cartTotal.toLocaleString('id-ID')}</div>
              </div>
            </div>

            <button
              onClick={scrollToCart}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer"
            >
              <span>Bayar</span>
              <ArrowDown className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleAddToCart}
        products={products}
      />

      {/* Thermal Receipt Print Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={completedTransaction}
        storeSettings={storeSettings}
      />

    </div>
  );
}

