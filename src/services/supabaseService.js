import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const supabaseService = {
  // Check connection status
  async checkConnection() {
    if (!isSupabaseConfigured()) {
      return { connected: false, message: 'Supabase URL / Key belum dikonfigurasi di .env' };
    }
    try {
      const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return { connected: true, message: 'Terhubung ke Supabase Database' };
    } catch (err) {
      return { connected: false, message: err.message };
    }
  },

  // Products
  async fetchProducts() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      buyPrice: Number(p.buy_price) || 0,
      sellPrice: Number(p.sell_price) || 0,
      stock: p.stock || 0,
      minStock: p.min_stock || 5,
      unit: p.unit || 'pcs',
      updatedAt: p.updated_at
    }));
  },

  async insertProduct(product) {
    if (!isSupabaseConfigured()) return null;
    const payload = {
      sku: product.sku,
      name: product.name,
      category: product.category,
      buy_price: product.buyPrice || 0,
      sell_price: product.sellPrice || 0,
      stock: product.stock || 0,
      min_stock: product.minStock || 5,
      unit: product.unit || 'pcs'
    };
    const { data, error } = await supabase.from('products').insert([payload]).select();
    if (error) throw error;
    return data[0];
  },

  async updateProduct(id, product) {
    if (!isSupabaseConfigured()) return null;
    const payload = {
      sku: product.sku,
      name: product.name,
      category: product.category,
      buy_price: product.buyPrice || 0,
      sell_price: product.sellPrice || 0,
      stock: product.stock || 0,
      min_stock: product.minStock || 5,
      unit: product.unit || 'pcs',
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  async deleteProduct(id) {
    if (!isSupabaseConfigured()) return true;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Categories
  async fetchCategories() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Transactions
  async insertTransaction(transaction, items) {
    if (!isSupabaseConfigured()) return null;

    // Use maybeSingle() instead of single() to avoid throwing PGRST116 when receipt does not exist
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('receipt_no', transaction.receiptNo)
      .maybeSingle();

    if (existingTx) {
      console.log(`[Supabase] Transaction ${transaction.receiptNo} already exists.`);
      return existingTx;
    }

    const { data: txData, error: txErr } = await supabase
      .from('transactions')
      .insert([{
        receipt_no: transaction.receiptNo,
        date: transaction.date,
        subtotal: transaction.subtotal,
        discount: transaction.discount || 0,
        tax: transaction.tax || 0,
        total: transaction.total,
        pay_amount: transaction.payAmount,
        change_amount: transaction.changeAmount,
        payment_method: transaction.paymentMethod,
        user_id: transaction.userId || null,
        status: transaction.status || 'SELESAI',
        sync_status: 'TERSYNC'
      }])
      .select();

    if (txErr) throw txErr;

    const insertedTx = txData[0];

    // Insert transaction items
    if (items && items.length > 0) {
      const formattedItems = items.map(item => ({
        transaction_id: insertedTx.id,
        product_id: item.id || null,
        sku: item.sku,
        name: item.name,
        buy_price: item.buyPrice || 0,
        sell_price: item.price || item.sellPrice || 0,
        qty: item.qty,
        subtotal: item.subtotal
      }));

      const { error: itemErr } = await supabase.from('transaction_items').insert(formattedItems);
      if (itemErr) throw itemErr;
    }

    return insertedTx;
  },

  async fetchTransactions() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
