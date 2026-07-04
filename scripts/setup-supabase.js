import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env.local if exists
const envPath = path.join(rootDir, '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...val] = trimmed.split('=');
      envVars[key.trim()] = val.join('=').trim();
    }
  });
}

const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

console.log('===================================================');
console.log('🚀 APLIKASI QASIR - AUTOMATED SUPABASE SETUP WIZARD');
console.log('===================================================');

if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-project-id')) {
  console.log('❌ URL atau Key Supabase belum diatur di .env.local');
  console.log('\nSilakan isi file .env.local dengan kredensial Supabase Anda:');
  console.log('SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here');
  console.log('\nAtau jalankan perintahkanlogin Supabase CLI:');
  console.log('npx supabase login');
  process.exit(1);
}

console.log(`📡 Menghubungkan ke Supabase: ${supabaseUrl}...`);
const supabase = createClient(supabaseUrl, serviceKey);

async function runSetup() {
  try {
    // 1. Check Connection & Test Tables
    console.log('\n1️⃣ Memeriksa Koneksi Database...');
    const { error: pingErr } = await supabase.from('products').select('count', { count: 'exact', head: true });

    if (pingErr && pingErr.code === '42P01') {
      console.log('⚠️ Tabel belum ada di Supabase. Silakan jalankan DDL Schema di Supabase SQL Editor.');
      console.log('📄 File DDL Schema: supabase/schema.sql');
    } else if (pingErr) {
      console.log('⚠️ Warning:', pingErr.message);
    } else {
      console.log('✅ Koneksi berhasil! Tabel `products` terdeteksi.');
    }

    // 2. Seed Initial Categories if empty
    console.log('\n2️⃣ Menyinkronkan Data Kategori...');
    const categories = [
      { id: 1, name: 'Sembako & Bumbu', icon: 'ShoppingBag' },
      { id: 2, name: 'Minuman', icon: 'Coffee' },
      { id: 3, name: 'Makanan Ringan', icon: 'Utensils' },
      { id: 4, name: 'Perawatan & Mandi', icon: 'Smile' },
      { id: 5, name: 'Kebutuhan Rumah', icon: 'Home' },
      { id: 6, name: 'Alat Tulis', icon: 'BookOpen' }
    ];

    const { error: catErr } = await supabase.from('categories').upsert(categories, { onConflict: 'id' });
    if (catErr) {
      console.log('⚠️ Kategori gagal di-upsert (Tabel mungkin belum dibuat):', catErr.message);
    } else {
      console.log('✅ 6 Kategori berhasil disinkronkan ke Supabase DB.');
    }

    // 3. Seed Initial Products
    console.log('\n3️⃣ Menyinkronkan Katalog Produk Retail...');
    const products = [
      { sku: '899999900001', name: 'Minyak Goreng Sania 2 Litur', category: 'Sembako & Bumbu', buy_price: 32000, sell_price: 36500, stock: 45, min_stock: 10, unit: 'pouch' },
      { sku: '899999900002', name: 'Beras Pandan Wangi 5kg', category: 'Sembako & Bumbu', buy_price: 68000, sell_price: 76000, stock: 20, min_stock: 5, unit: 'karung' },
      { sku: '899100100003', name: 'Gula Pasir Gulaku 1kg', category: 'Sembako & Bumbu', buy_price: 15000, sell_price: 17500, stock: 35, min_stock: 8, unit: 'bungkus' },
      { sku: '899200200004', name: 'Teh Botol Sosro 450ml', category: 'Minuman', buy_price: 4000, sell_price: 6000, stock: 60, min_stock: 15, unit: 'botol' },
      { sku: '899300300005', name: 'Kopi Kapal Api Grande 20g', category: 'Minuman', buy_price: 1500, sell_price: 2500, stock: 120, min_stock: 20, unit: 'sachet' },
      { sku: '899400400006', name: 'Air Mineral Le Minerale 600ml', category: 'Minuman', buy_price: 2500, sell_price: 4000, stock: 80, min_stock: 24, unit: 'botol' },
      { sku: '899500500007', name: 'Indomie Goreng Spesial 85g', category: 'Makanan Ringan', buy_price: 2800, sell_price: 3500, stock: 150, min_stock: 30, unit: 'bungkus' },
      { sku: '899600600008', name: 'Chitato Sapi Panggang 68g', category: 'Makanan Ringan', buy_price: 9500, sell_price: 12000, stock: 4, min_stock: 10, unit: 'bungkus' },
      { sku: '899700700009', name: 'Sabun Lifebuoy Total 10 110g', category: 'Perawatan & Mandi', buy_price: 4200, sell_price: 5500, stock: 40, min_stock: 10, unit: 'pcs' },
      { sku: '899800800010', name: 'Shampoo Pantene Hair Fall 160ml', category: 'Perawatan & Mandi', buy_price: 22000, sell_price: 26500, stock: 18, min_stock: 5, unit: 'botol' },
      { sku: '899900900011', name: 'Deterjen Rinso Anti Noda 770g', category: 'Kebutuhan Rumah', buy_price: 19500, sell_price: 23500, stock: 25, min_stock: 6, unit: 'pouch' },
      { sku: '899111100012', name: 'Pembersih Lantai Super Pell 770ml', category: 'Kebutuhan Rumah', buy_price: 13500, sell_price: 16500, stock: 2, min_stock: 5, unit: 'pouch' }
    ];

    const { error: prodErr } = await supabase.from('products').upsert(products, { onConflict: 'sku' });
    if (prodErr) {
      console.log('⚠️ Produk gagal di-upsert:', prodErr.message);
    } else {
      console.log('✅ 12 Produk Retail berhasil disinkronkan ke Supabase DB.');
    }

    // 4. Update MCP Config Files
    console.log('\n4️⃣ Memperbarui Konfigurasi Supabase MCP...');
    const mcpConfig = {
      mcpServers: {
        supabase: {
          command: "npx",
          args: ["-y", "@supabase/mcp-server-supabase"],
          env: {
            SUPABASE_URL: supabaseUrl,
            SUPABASE_SERVICE_ROLE_KEY: serviceKey
          }
        }
      }
    };

    fs.writeFileSync(path.join(rootDir, 'mcp-supabase-config.json'), JSON.stringify(mcpConfig, null, 2));

    const globalMcpPath = 'C:\\Users\\ditow\\.gemini\\antigravity-ide\\mcp_config.json';
    try {
      fs.writeFileSync(globalMcpPath, JSON.stringify(mcpConfig, null, 2));
      console.log('✅ MCP Config Global & Workspace berhasil diperbarui!');
    } catch (e) {
      console.log('✅ MCP Config Workspace berhasil diperbarui!');
    }

    console.log('\n===================================================');
    console.log('🎉 PROSES OTOMATISASI SUPABASE SELESAI!');
    console.log('===================================================');
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat otomatisasi:', err.message);
  }
}

runSetup();
