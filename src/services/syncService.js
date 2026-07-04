import { db } from '../db/dexieDb';

export const syncService = {
  // Sync pending transactions to server
  async syncPendingData() {
    try {
      const pendingTx = await db.transactions
        .where('syncStatus')
        .equals('MENUNGGU_SYNC')
        .toArray();

      if (pendingTx.length === 0) {
        return { success: true, count: 0, message: 'Semua data sudah tersinkronisasi.' };
      }

      console.log(`Syncing ${pendingTx.length} pending transactions...`);

      // Simulate network request delay to cloud/local server
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mark items as synced
      for (const tx of pendingTx) {
        await db.transactions.update(tx.id, {
          syncStatus: 'TERSYNC'
        });
      }

      return {
        success: true,
        count: pendingTx.length,
        message: `${pendingTx.length} transaksi berhasil disinkronkan ke Cloud!`
      };
    } catch (err) {
      console.error('Error syncing data:', err);
      return { success: false, count: 0, message: err.message };
    }
  },

  // Get total pending unsynced items
  async getPendingCount() {
    return await db.transactions.where('syncStatus').equals('MENUNGGU_SYNC').count();
  }
};
