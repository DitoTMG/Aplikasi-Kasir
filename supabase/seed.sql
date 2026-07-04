-- Seed data for Aplikasi Qasir

INSERT INTO public.categories (id, name, icon) VALUES
(1, 'Sembako & Bumbu', 'ShoppingBag'),
(2, 'Minuman', 'Coffee'),
(3, 'Makanan Ringan', 'Utensils'),
(4, 'Perawatan & Mandi', 'Smile'),
(5, 'Kebutuhan Rumah', 'Home'),
(6, 'Alat Tulis', 'BookOpen')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (sku, name, category, buy_price, sell_price, stock, min_stock, unit) VALUES
('899999900001', 'Minyak Goreng Sania 2 Litur', 'Sembako & Bumbu', 32000, 36500, 45, 10, 'pouch'),
('899999900002', 'Beras Pandan Wangi 5kg', 'Sembako & Bumbu', 68000, 76000, 20, 5, 'karung'),
('899100100003', 'Gula Pasir Gulaku 1kg', 'Sembako & Bumbu', 15000, 17500, 35, 8, 'bungkus'),
('899200200004', 'Teh Botol Sosro 450ml', 'Minuman', 4000, 6000, 60, 15, 'botol'),
('899300300005', 'Kopi Kapal Api Grande 20g', 'Minuman', 1500, 2500, 120, 20, 'sachet'),
('899400400006', 'Air Mineral Le Minerale 600ml', 'Minuman', 2500, 4000, 80, 24, 'botol'),
('899500500007', 'Indomie Goreng Spesial 85g', 'Makanan Ringan', 2800, 3500, 150, 30, 'bungkus'),
('899600600008', 'Chitato Sapi Panggang 68g', 'Makanan Ringan', 9500, 12000, 4, 10, 'bungkus'),
('899700700009', 'Sabun Lifebuoy Total 10 110g', 'Perawatan & Mandi', 4200, 5500, 40, 10, 'pcs'),
('899800800010', 'Shampoo Pantene Hair Fall 160ml', 'Perawatan & Mandi', 22000, 26500, 18, 5, 'botol'),
('899900900011', 'Deterjen Rinso Anti Noda 770g', 'Kebutuhan Rumah', 19500, 23500, 25, 6, 'pouch'),
('899111100012', 'Pembersih Lantai Super Pell 770ml', 'Kebutuhan Rumah', 13500, 16500, 2, 5, 'pouch')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
('storeName', 'Toko Berkah Utama'),
('storeAddress', 'Jl. Raya Merdeka No. 88, Jakarta Selatan'),
('storePhone', '0812-3456-7890'),
('receiptFooter', 'Terima Kasih Atas Kunjungan Anda! Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.'),
('taxRate', '0'),
('enableAutoSync', 'true'),
('theme', 'dark')
ON CONFLICT (key) DO NOTHING;
