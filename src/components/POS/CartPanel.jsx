import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle,
  Tag
} from 'lucide-react';

export default function CartPanel({ 
  cart, 
  onUpdateQty, 
  onRemoveItem, 
  onClearCart, 
  onCheckout,
  discount,
  setDiscount
}) {
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [payAmount, setPayAmount] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.sellPrice * item.qty, 0);
  const total = Math.max(0, subtotal - discount);
  const numericPay = parseFloat(payAmount) || 0;
  const changeAmount = paymentMethod === 'Tunai' ? Math.max(0, numericPay - total) : 0;
  const isPayEnough = paymentMethod !== 'Tunai' || numericPay >= total;

  const quickNominals = [
    { label: 'Uang Pas', value: total },
    { label: '50.000', value: 50000 },
    { label: '100.000', value: 100000 }
  ];

  const handleCheckoutSubmit = () => {
    if (cart.length === 0) return;
    if (!isPayEnough) return;

    onCheckout({
      items: cart.map(item => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        price: item.sellPrice,
        buyPrice: item.buyPrice,
        qty: item.qty,
        subtotal: item.sellPrice * item.qty
      })),
      subtotal,
      discount,
      total,
      payAmount: paymentMethod === 'Tunai' ? numericPay : total,
      changeAmount,
      paymentMethod
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col h-full text-slate-900 dark:text-slate-100 shadow-xs transition-colors">
      
      {/* Header Cart */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Keranjang Belanja</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{cart.length} Jenis Barang</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2 min-h-[180px] max-h-[300px] sm:max-h-[360px] pr-1">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center p-6">
            <ShoppingBag className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Keranjang Masih Kosong</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Klik produk atau scan barcode untuk menambah transaksi</p>
          </div>
        ) : (
          cart.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition"
            >
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.name}</h4>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-300 font-semibold tabular-nums">
                  Rp {item.sellPrice.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
                  <button
                    onClick={() => onUpdateQty(item.id, item.qty - 1)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white tabular-nums">{item.qty}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, item.qty + 1)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="w-16 text-right font-extrabold text-xs text-slate-900 dark:text-white tabular-nums">
                  Rp {(item.sellPrice * item.qty).toLocaleString('id-ID')}
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Options & Summary Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
        
        {/* Discount Input */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium">Diskon Transaksi (Rp):</span>
          </span>
          <input
            type="number"
            value={discount || ''}
            onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="0"
            className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
          />
        </div>

        {/* Totals */}
        <div className="space-y-1 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="tabular-nums">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold">
              <span>Diskon</span>
              <span className="tabular-nums">-Rp {discount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
            <span>Total Bayar</span>
            <span className="text-indigo-600 dark:text-indigo-400 tabular-nums">Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setPaymentMethod('Tunai')}
              className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                paymentMethod === 'Tunai'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Tunai</span>
            </button>

            <button
              onClick={() => setPaymentMethod('QRIS')}
              className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                paymentMethod === 'QRIS'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QRIS</span>
            </button>

            <button
              onClick={() => setPaymentMethod('Transfer')}
              className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                paymentMethod === 'Transfer'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Debit/TF</span>
            </button>
          </div>
        </div>

        {/* Cash Calculation Controls */}
        {paymentMethod === 'Tunai' && (
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Jumlah Uang Diterima..."
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
              />
              <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 min-w-[90px] text-right tabular-nums">
                Kembali: Rp {changeAmount.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Quick Cash Buttons */}
            <div className="flex space-x-1.5">
              {quickNominals.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setPayAmount(item.value.toString())}
                  className="flex-1 bg-white dark:bg-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white border border-slate-200 dark:border-slate-700 text-[10px] py-1 rounded-md font-semibold transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Final Checkout Button */}
        <button
          onClick={handleCheckoutSubmit}
          disabled={cart.length === 0 || !isPayEnough}
          className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs ${
            cart.length === 0 || !isPayEnough
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>PROSES BAYAR & CETAK STRUK</span>
        </button>

      </div>
    </div>
  );
}

