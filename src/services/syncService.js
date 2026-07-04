import { db } from '../db/dexieDb';
import { supabaseService } from './supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

let realtimeChannel = null;

export const syncService = {
  // Sync products from Supabase Cloud to local Dexie DB
  async syncProductsFromCloud() {
    if (!isSupabaseConfigured()) return;
    try {
      const cloudProducts = await supabaseService.fetchProducts();
      if (!cloudProducts) return;

      const localProducts = await db.products.toArray();
      const cloudIds = new Set(cloudProducts.map(p => p.id));
      const cloudSkus = new Set(cloudProducts.map(p => p.sku));

      // Put/update cloud products into local Dexie
      for (const cp of cloudProducts) {
        const localMatch = localProducts.find(lp => lp.id === cp.id || lp.sku === cp.sku);
        if (localMatch) {
          await db.products.put({ ...cp, id: localMatch.id });
        } else {
          await db.products.add(cp);
        }
      }

      // Clean up local items deleted in Cloud
      for (const lp of localProducts) {
        if (!cloudIds.has(lp.id) && !cloudSkus.has(lp.sku)) {
          console.log(`[Sync] Removing local product ${lp.name} (SKU: ${lp.sku}) deleted from Cloud`);
          await db.products.delete(lp.id);
        }
      }
    } catch (err) {
      console.warn('[Sync] Could not sync products from cloud:', err.message);
    }
  },

  // Sync transactions from Supabase Cloud to local Dexie DB
  async syncTransactionsFromCloud() {
    if (!isSupabaseConfigured()) return;
    try {
      const cloudTxs = await supabaseService.fetchTransactions();
      if (!cloudTxs) return;

      for (const ctx of cloudTxs) {
        const formattedTx = {
          receiptNo: ctx.receipt_no,
          date: ctx.date || ctx.created_at,
          subtotal: Number(ctx.subtotal) || 0,
          discount: Number(ctx.discount) || 0,
          tax: Number(ctx.tax) || 0,
          total: Number(ctx.total) || 0,
          payAmount: Number(ctx.pay_amount) || 0,
          changeAmount: Number(ctx.change_amount) || 0,
          paymentMethod: ctx.payment_method || 'Tunai',
          status: ctx.status || 'SELESAI',
          syncStatus: 'TERSYNC',
          createdAt: ctx.created_at,
          items: (ctx.transaction_items || []).map(item => ({
            id: item.product_id,
            sku: item.sku,
            name: item.name,
            buyPrice: Number(item.buy_price) || 0,
            price: Number(item.sell_price) || 0,
            qty: item.qty,
            subtotal: Number(item.subtotal) || 0
          }))
        };

        const existing = await db.transactions.where('receiptNo').equals(ctx.receipt_no).first();
        if (existing) {
          await db.transactions.put({ ...formattedTx, id: existing.id });
        } else {
          await db.transactions.add(formattedTx);
        }
      }
    } catch (err) {
      console.warn('[Sync] Could not sync transactions from cloud:', err.message);
    }
  },

  // Subscribe to Supabase Realtime changes across devices
  subscribeRealtime() {
    if (!isSupabaseConfigured()) return null;
    if (realtimeChannel) return realtimeChannel;

    console.log('[Realtime] Subscribing to Supabase Realtime channels...');

    realtimeChannel = supabase
      .channel('qasir_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async (payload) => {
          console.log('[Realtime] Product event:', payload.eventType, payload);

          if (payload.eventType === 'DELETE') {
            const oldItem = payload.old;
            if (oldItem.id) {
              await db.products.delete(oldItem.id);
            }
            if (oldItem.sku) {
              const match = await db.products.where('sku').equals(oldItem.sku).first();
              if (match) {
                await db.products.delete(match.id);
              }
            }
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const p = payload.new;
            const converted = {
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
            };

            const existing = await db.products.where('sku').equals(p.sku).first();
            if (existing) {
              await db.products.put({ ...converted, id: existing.id });
            } else {
              await db.products.put(converted);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        async (payload) => {
          console.log('[Realtime] Category event:', payload.eventType, payload);
          if (payload.eventType === 'DELETE') {
            if (payload.old.id) {
              await db.categories.delete(payload.old.id);
            }
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            await db.categories.put({
              id: payload.new.id,
              name: payload.new.name,
              icon: payload.new.icon || 'Tag'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        async (payload) => {
          console.log('[Realtime] Transaction event:', payload.eventType, payload);
          if (payload.eventType === 'DELETE') {
            if (payload.old.id) {
              await db.transactions.delete(payload.old.id);
            }
            if (payload.old.receipt_no) {
              const match = await db.transactions.where('receiptNo').equals(payload.old.receipt_no).first();
              if (match) {
                await db.transactions.delete(match.id);
              }
            }
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Instantly pull & sync the transaction into Dexie DB
            await syncService.syncTransactionsFromCloud();
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    return realtimeChannel;
  },

  unsubscribeRealtime() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  },

  // Sync pending transactions to Supabase cloud
  async syncPendingData() {
    try {
      if (!isSupabaseConfigured()) {
        return { 
          success: false, 
          count: 0, 
          message: 'Supabase belum dikonfigurasi. Sync tidak dapat dilakukan.' 
        };
      }

      // Sync products and transactions from cloud
      await this.syncProductsFromCloud();
      await this.syncTransactionsFromCloud();

      const pendingTx = await db.transactions
        .where('syncStatus')
        .equals('MENUNGGU_SYNC')
        .toArray();

      if (pendingTx.length === 0) {
        return { success: true, count: 0, message: 'Semua data sudah tersinkronisasi.' };
      }

      console.log(`[Sync] Syncing ${pendingTx.length} pending transactions to Supabase...`);

      let syncedCount = 0;
      const errors = [];

      for (const tx of pendingTx) {
        try {
          await supabaseService.insertTransaction(tx, tx.items || []);
          await db.transactions.update(tx.id, { syncStatus: 'TERSYNC' });
          syncedCount++;
        } catch (err) {
          console.error(`[Sync] Failed to sync ${tx.receiptNo}:`, err.message);
          if (err.message?.includes('duplicate') || err.message?.includes('unique')) {
            await db.transactions.update(tx.id, { syncStatus: 'TERSYNC' });
            syncedCount++;
          } else {
            errors.push({ receiptNo: tx.receiptNo, error: err.message });
          }
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          count: syncedCount,
          message: `${syncedCount} transaksi berhasil disync. ${errors.length} gagal: ${errors[0].error}`
        };
      }

      return {
        success: true,
        count: syncedCount,
        message: `${syncedCount} transaksi berhasil disinkronkan ke Supabase Cloud!`
      };
    } catch (err) {
      console.error('[Sync] Error syncing data:', err);
      return { success: false, count: 0, message: err.message };
    }
  },

  // Get total pending unsynced items
  async getPendingCount() {
    return await db.transactions.where('syncStatus').equals('MENUNGGU_SYNC').count();
  }
};
