// Use Supabase JS client with service_role to apply schema
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fajherjsqsirlyawdqov.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhamhlcmpzcXNpcmx5YXdkcW92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzEyNzc1NywiZXhwIjoyMDk4NzAzNzU3fQ.TB0LLxzTcxMIcY8py7AW1fCzsDhZhgBMFgr7gjt1LJc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const OWNER_ID = '57ab7ff1-f09d-4221-875b-9c2fd888beaa';

async function main() {
  console.log('========================================');
  console.log('  Setup Owner Profile via Supabase JS');
  console.log('========================================\n');

  // Step 1: Check if profiles table exists
  console.log('Step 1: Checking if profiles table exists...');
  const { data: profileCheck, error: checkErr } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (checkErr) {
    console.log(`Profiles table status: ${checkErr.message}`);
    
    if (checkErr.message.includes('does not exist') || checkErr.code === '42P01') {
      console.log('\n❌ Profiles table does not exist yet!');
      console.log('You need to run the SQL schema in Supabase Dashboard.\n');
      console.log('Please go to: https://supabase.com/dashboard/project/fajherjsqsirlyawdqov/sql/new');
      console.log('And run the following SQL:\n');
      
      console.log(`
-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Kasir',
    role TEXT NOT NULL DEFAULT 'kasir' CHECK (role IN ('owner', 'kasir')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. RLS policies for profiles
CREATE POLICY "Authenticated users can view profiles"
    ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. Helper function
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'owner'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_count INT;
    assigned_role TEXT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    IF user_count = 0 THEN
        assigned_role := 'owner';
    ELSE
        assigned_role := 'kasir';
    END IF;
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Kasir'),
        assigned_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Add user_id to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. Insert owner profile
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('${OWNER_ID}', 'damairaya2004@gmail.com', 'Owner Toko', 'owner')
ON CONFLICT (id) DO UPDATE SET role = 'owner', full_name = 'Owner Toko';

-- 7. Drop old open-access policies
DROP POLICY IF EXISTS "Allow anon select categories" ON public.categories;
DROP POLICY IF EXISTS "Allow anon insert categories" ON public.categories;
DROP POLICY IF EXISTS "Allow anon update categories" ON public.categories;
DROP POLICY IF EXISTS "Allow anon delete categories" ON public.categories;
DROP POLICY IF EXISTS "Allow anon select products" ON public.products;
DROP POLICY IF EXISTS "Allow anon insert products" ON public.products;
DROP POLICY IF EXISTS "Allow anon update products" ON public.products;
DROP POLICY IF EXISTS "Allow anon delete products" ON public.products;
DROP POLICY IF EXISTS "Allow anon select transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow anon insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow anon update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow anon delete transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow anon select transaction_items" ON public.transaction_items;
DROP POLICY IF EXISTS "Allow anon insert transaction_items" ON public.transaction_items;
DROP POLICY IF EXISTS "Allow anon update transaction_items" ON public.transaction_items;
DROP POLICY IF EXISTS "Allow anon delete transaction_items" ON public.transaction_items;
DROP POLICY IF EXISTS "Allow anon select settings" ON public.settings;
DROP POLICY IF EXISTS "Allow anon insert settings" ON public.settings;
DROP POLICY IF EXISTS "Allow anon update settings" ON public.settings;

-- 8. New secure policies (authenticated only)
CREATE POLICY IF NOT EXISTS "Authenticated select categories" ON public.categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Authenticated insert categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Authenticated update categories" ON public.categories FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Owner delete categories" ON public.categories FOR DELETE USING (public.is_owner());

CREATE POLICY IF NOT EXISTS "Authenticated select products" ON public.products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Authenticated insert products" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Authenticated update products" ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Owner delete products" ON public.products FOR DELETE USING (public.is_owner());

CREATE POLICY IF NOT EXISTS "Authenticated select transactions" ON public.transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Authenticated insert transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Authenticated update transactions" ON public.transactions FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Owner delete transactions" ON public.transactions FOR DELETE USING (public.is_owner());

CREATE POLICY IF NOT EXISTS "Authenticated select transaction_items" ON public.transaction_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Authenticated insert transaction_items" ON public.transaction_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Authenticated update transaction_items" ON public.transaction_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Owner delete transaction_items" ON public.transaction_items FOR DELETE USING (public.is_owner());

CREATE POLICY IF NOT EXISTS "Authenticated select settings" ON public.settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Owner insert settings" ON public.settings FOR INSERT WITH CHECK (public.is_owner());
CREATE POLICY IF NOT EXISTS "Owner update settings" ON public.settings FOR UPDATE USING (public.is_owner());
      `);
      return;
    }
  }

  // If table exists, try to upsert the owner profile
  console.log('Profiles table exists! Upserting owner profile...\n');

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: OWNER_ID,
      email: 'damairaya2004@gmail.com',
      full_name: 'Owner Toko',
      role: 'owner'
    }, { onConflict: 'id' })
    .select();

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('✅ Owner profile created/updated successfully!');
    console.log(data);
  }

  // Verify
  console.log('\nVerifying profile...');
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', OWNER_ID)
    .single();

  if (profile) {
    console.log('✅ Profile verified:');
    console.log(`   ID: ${profile.id}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Name: ${profile.full_name}`);
    console.log(`   Role: ${profile.role}`);
  }

  console.log('\n========================================');
  console.log('📋 Owner Login Credentials:');
  console.log('   Email:    damairaya2004@gmail.com');
  console.log('   Password: ManusiaBiasa2004');
  console.log('   Role:     Owner (Pemilik Toko)');
  console.log('========================================\n');
}

main().catch(console.error);
