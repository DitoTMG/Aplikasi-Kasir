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
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  async insertProduct(product) {
    const { data, error } = await supabase.from('products').insert([product]).select();
    if (error) throw error;
    return data[0];
  },

  async updateProduct(id, product) {
    const { data, error } = await supabase.from('products').update(product).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  async deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Categories
  async fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Transactions
  async insertTransaction(transaction, items) {
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
    const { data, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
