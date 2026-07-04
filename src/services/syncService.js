import { db } from '../db/dexieDb';
import { supabaseService } from './supabaseService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export const syncService = {
  // Sync pending transactions to Supabase cloud
  async syncPendingData() {
    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        return { 
          success: false, 
          count: 0, 
          message: 'Supabase belum dikonfigurasi. Sync tidak dapat dilakukan.' 
        };
      }

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
          // Sync transaction to Supabase
          await supabaseService.insertTransaction(tx, tx.items || []);

          // Mark as synced in local DB
          await db.transactions.update(tx.id, {
            syncStatus: 'TERSYNC'
          });

          syncedCount++;
          console.log(`[Sync] Transaction ${tx.receiptNo} synced successfully.`);
        } catch (err) {
          console.error(`[Sync] Failed to sync ${tx.receiptNo}:`, err.message);
          
          // If duplicate receipt, mark as synced anyway
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
