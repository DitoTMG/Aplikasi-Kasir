import Dexie from 'dexie';

export const db = new Dexie('AplikasiKasirTokoDB');

// Define database schema
db.version(1).stores({
  products: '++id, sku, name, category, buyPrice, sellPrice, stock, minStock, unit, updatedAt',
  categories: '++id, name, icon',
  transactions: '++id, receiptNo, date, items, subtotal, discount, tax, total, payAmount, changeAmount, paymentMethod, status, syncStatus, createdAt',
  settings: 'key, value',
  syncQueue: '++id, type, payload, createdAt'
});

// Seed Initial Sample Data
export async function seedInitialData() {
  const productCount = await db.products.count();
  if (productCount === 0) {
    console.log('Seeding initial retail products data...');

    const initialCategories = [
      { id: 1, name: 'Sembako & Bumbu', icon: 'ShoppingBag' },
      { id: 2, name: 'Minuman', icon: 'Coffee' },
      { id: 3, name: 'Makanan Ringan', icon: 'Utensils' },
      { id: 4, name: 'Perawatan & Mandi', icon: 'Smile' },
      { id: 5, name: 'Kebutuhan Rumah', icon: 'Home' },
      { id: 6, name: 'Alat Tulis', icon: 'BookOpen' }
    ];
    await db.categories.bulkAdd(initialCategories);

    const initialProducts = [
      {
        sku: '899999900001',
        name: 'Minyak Goreng Sania 2 Litur',
        category: 'Sembako & Bumbu',
        buyPrice: 32000,
        sellPrice: 36500,
        stock: 45,
        minStock: 10,
        unit: 'pouch',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899999900002',
        name: 'Beras Pandan Wangi 5kg',
        category: 'Sembako & Bumbu',
        buyPrice: 68000,
        sellPrice: 76000,
        stock: 20,
        minStock: 5,
        unit: 'karung',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899100100003',
        name: 'Gula Pasir Gulaku 1kg',
        category: 'Sembako & Bumbu',
        buyPrice: 15000,
        sellPrice: 17500,
        stock: 35,
        minStock: 8,
        unit: 'bungkus',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899200200004',
        name: 'Teh Botol Sosro 450ml',
        category: 'Minuman',
        buyPrice: 4000,
        sellPrice: 6000,
        stock: 60,
        minStock: 15,
        unit: 'botol',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899300300005',
        name: 'Kopi Kapal Api Grande 20g',
        category: 'Minuman',
        buyPrice: 1500,
        sellPrice: 2500,
        stock: 120,
        minStock: 20,
        unit: 'sachet',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899400400006',
        name: 'Air Mineral Le Minerale 600ml',
        category: 'Minuman',
        buyPrice: 2500,
        sellPrice: 4000,
        stock: 80,
        minStock: 24,
        unit: 'botol',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899500500007',
        name: 'Indomie Goreng Spesial 85g',
        category: 'Makanan Ringan',
        buyPrice: 2800,
        sellPrice: 3500,
        stock: 150,
        minStock: 30,
        unit: 'bungkus',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899600600008',
        name: 'Chitato Sapi Panggang 68g',
        category: 'Makanan Ringan',
        buyPrice: 9500,
        sellPrice: 12000,
        stock: 4,
        minStock: 10,
        unit: 'bungkus',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899700700009',
        name: 'Sabun Lifebuoy Total 10 110g',
        category: 'Perawatan & Mandi',
        buyPrice: 4200,
        sellPrice: 5500,
        stock: 40,
        minStock: 10,
        unit: 'pcs',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899800800010',
        name: 'Shampoo Pantene Hair Fall 160ml',
        category: 'Perawatan & Mandi',
        buyPrice: 22000,
        sellPrice: 26500,
        stock: 18,
        minStock: 5,
        unit: 'botol',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899900900011',
        name: 'Deterjen Rinso Anti Noda 770g',
        category: 'Kebutuhan Rumah',
        buyPrice: 19500,
        sellPrice: 23500,
        stock: 25,
        minStock: 6,
        unit: 'pouch',
        updatedAt: new Date().toISOString()
      },
      {
        sku: '899111100012',
        name: 'Pembersih Lantai Super Pell 770ml',
        category: 'Kebutuhan Rumah',
        buyPrice: 13500,
        sellPrice: 16500,
        stock: 2,
        minStock: 5,
        unit: 'pouch',
        updatedAt: new Date().toISOString()
      }
    ];
    await db.products.bulkAdd(initialProducts);

    // Initial Store Settings
    const defaultSettings = [
      { key: 'storeName', value: 'Toko Berkah Utama' },
      { key: 'storeAddress', value: 'Jl. Raya Merdeka No. 88, Jakarta Selatan' },
      { key: 'storePhone', value: '0812-3456-7890' },
      { key: 'receiptFooter', value: 'Terima Kasih Atas Kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan.' },
      { key: 'taxRate', value: 0 },
      { key: 'enableAutoSync', value: true },
      { key: 'localServerIp', value: '192.168.1.10:3000' },
      { key: 'theme', value: 'dark' }
    ];
    await db.settings.bulkAdd(defaultSettings);

    const sampleTx = {
      receiptNo: 'TRX-20260704-001',
      date: new Date(Date.now() - 3600000).toISOString(),
      items: [
        { id: 1, sku: '899999900001', name: 'Minyak Goreng Sania 2 Litur', price: 36500, buyPrice: 32000, qty: 1, subtotal: 36500 },
        { id: 4, sku: '899200200004', name: 'Teh Botol Sosro 450ml', price: 6000, buyPrice: 4000, qty: 2, subtotal: 12000 }
      ],
      subtotal: 48500,
      discount: 0,
      tax: 0,
      total: 48500,
      payAmount: 50000,
      changeAmount: 1500,
      paymentMethod: 'Tunai',
      status: 'SELESAI',
      syncStatus: 'TERSYNC',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    };
    await db.transactions.add(sampleTx);
  }
}
