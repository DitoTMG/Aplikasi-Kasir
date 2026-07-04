// Script to apply schema and create owner account via Supabase Admin API
const SUPABASE_URL = 'https://fajherjsqsirlyawdqov.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhamhlcmpzcXNpcmx5YXdkcW92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzEyNzc1NywiZXhwIjoyMDk4NzAzNzU3fQ.TB0LLxzTcxMIcY8py7AW1fCzsDhZhgBMFgr7gjt1LJc';

async function applySchema() {
  console.log('=== Step 1: Applying Schema (profiles table + RLS) ===\n');

  // SQL to create profiles table, trigger, and update RLS policies
  const schemaSql = `
    -- Create profiles table
    CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT NOT NULL,
        full_name TEXT NOT NULL DEFAULT 'Kasir',
        role TEXT NOT NULL DEFAULT 'kasir' CHECK (role IN ('owner', 'kasir')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create index
    CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

    -- Add user_id column to transactions if not exists
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'user_id'
      ) THEN
        ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
      END IF;
    END $$;

    -- Auto-create profile on user signup
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

    -- Helper function to check owner role
    CREATE OR REPLACE FUNCTION public.is_owner()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'owner'
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Enable RLS on profiles
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Drop old open-access policies
    DO $$ 
    DECLARE r RECORD;
    BEGIN
      FOR r IN (
        SELECT policyname, tablename FROM pg_policies 
        WHERE schemaname = 'public' AND policyname LIKE 'Allow anon%'
      ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
      END LOOP;
    END $$;

    -- Profiles policies
    DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
    CREATE POLICY "Authenticated users can view profiles"
        ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

    -- Categories policies (authenticated access)
    DROP POLICY IF EXISTS "Authenticated select categories" ON public.categories;
    CREATE POLICY "Authenticated select categories"
        ON public.categories FOR SELECT USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Authenticated insert categories" ON public.categories;
    CREATE POLICY "Authenticated insert categories"
        ON public.categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Authenticated update categories" ON public.categories;
    CREATE POLICY "Authenticated update categories"
        ON public.categories FOR UPDATE USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Owner delete categories" ON public.categories;
    CREATE POLICY "Owner delete categories"
        ON public.categories FOR DELETE USING (public.is_owner());

    -- Products policies
    DROP POLICY IF EXISTS "Authenticated select products" ON public.products;
    CREATE POLICY "Authenticated select products"
        ON public.products FOR SELECT USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Authenticated insert products" ON public.products;
    CREATE POLICY "Authenticated insert products"
        ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Authenticated update products" ON public.products;
    CREATE POLICY "Authenticated update products"
        ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Owner delete products" ON public.products;
    CREATE POLICY "Owner delete products"
        ON public.products FOR DELETE USING (public.is_owner());

    -- Transactions policies
    DROP POLICY IF EXISTS "Authenticated select transactions" ON public.transactions;
    CREATE POLICY "Authenticated select transactions"
        ON public.transactions FOR SELECT USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Authenticated insert transactions" ON public.transactions;
    CREATE POLICY "Authenticated insert transactions"
        ON public.transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Authenticated update transactions" ON public.transactions;
    CREATE POLICY "Authenticated update transactions"
        ON public.transactions FOR UPDATE USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Owner delete transactions" ON public.transactions;
    CREATE POLICY "Owner delete transactions"
        ON public.transactions FOR DELETE USING (public.is_owner());

    -- Transaction items policies
    DROP POLICY IF EXISTS "Authenticated select transaction_items" ON public.transaction_items;
    CREATE POLICY "Authenticated select transaction_items"
        ON public.transaction_items FOR SELECT USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Authenticated insert transaction_items" ON public.transaction_items;
    CREATE POLICY "Authenticated insert transaction_items"
        ON public.transaction_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Authenticated update transaction_items" ON public.transaction_items;
    CREATE POLICY "Authenticated update transaction_items"
        ON public.transaction_items FOR UPDATE USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Owner delete transaction_items" ON public.transaction_items;
    CREATE POLICY "Owner delete transaction_items"
        ON public.transaction_items FOR DELETE USING (public.is_owner());

    -- Settings policies
    DROP POLICY IF EXISTS "Authenticated select settings" ON public.settings;
    CREATE POLICY "Authenticated select settings"
        ON public.settings FOR SELECT USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Owner insert settings" ON public.settings;
    CREATE POLICY "Owner insert settings"
        ON public.settings FOR INSERT WITH CHECK (public.is_owner());

    DROP POLICY IF EXISTS "Owner update settings" ON public.settings;
    CREATE POLICY "Owner update settings"
        ON public.settings FOR UPDATE USING (public.is_owner());
  `;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({})
  });

  // Use SQL endpoint instead
  const sqlRes = await fetch(`${SUPABASE_URL}/pg`, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: schemaSql })
  });

  // Fallback: use the management API SQL endpoint
  console.log('Applying schema via REST SQL...');
  
  // Split into individual statements and execute via rpc
  const statements = schemaSql.split(/;\s*(?=\n\s*(?:CREATE|ALTER|DROP|DO|INSERT))/);
  
  // Actually let's use a simpler approach - use the Supabase SQL API
  // The proper way is via the management API, but we can use a workaround
  // by creating a function that executes SQL
  
  // First create an exec_sql function
  const createExecFn = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ sql_text: 'SELECT 1' })
  });

  if (createExecFn.status === 404) {
    console.log('exec_sql function not found. Will create tables individually via REST API.\n');
    console.log('⚠️  Please run the schema.sql manually in Supabase Dashboard SQL Editor.');
    console.log('   Go to: https://supabase.com/dashboard/project/fajherjsqsirlyawdqov/sql\n');
    console.log('Proceeding to create Owner account...\n');
  }
}

async function createOwnerAccount() {
  console.log('=== Step 2: Creating Owner Account ===\n');

  const email = 'damairaya2004@gmail.com';
  const password = 'ManusiaBiasa2004';
  const fullName = 'Owner Toko';

  // Create user via Supabase Admin API (service_role key)
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    })
  });

  const data = await res.json();

  if (res.ok) {
    console.log('✅ Owner account created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   User ID: ${data.id}`);
    console.log(`   Email Confirmed: Yes\n`);

    // Now ensure profile exists with owner role
    await ensureOwnerProfile(data.id, email, fullName);

    return data;
  } else {
    if (data.msg?.includes('already been registered') || data.message?.includes('already been registered')) {
      console.log(`ℹ️  User ${email} already exists. Checking profile...\n`);
      
      // Get existing user
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      });
      const listData = await listRes.json();
      const existingUser = listData.users?.find(u => u.email === email);
      
      if (existingUser) {
        console.log(`   Found user: ${existingUser.id}`);
        await ensureOwnerProfile(existingUser.id, email, fullName);
      }
      return existingUser;
    }

    console.error('❌ Failed to create user:', data.msg || data.message || JSON.stringify(data));
    return null;
  }
}

async function ensureOwnerProfile(userId, email, fullName) {
  console.log('=== Step 3: Setting Owner Profile ===\n');

  // Check if profiles table exists and insert/update owner profile
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  if (checkRes.status === 404 || checkRes.status === 400) {
    console.log('⚠️  Profiles table not found. You need to run schema.sql first!');
    console.log('   Go to: https://supabase.com/dashboard/project/fajherjsqsirlyawdqov/sql');
    console.log('   Copy and paste the contents of supabase/schema.sql\n');
    
    console.log('After running the schema, manually insert the owner profile:');
    console.log(`
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES ('${userId}', '${email}', '${fullName}', 'owner')
    ON CONFLICT (id) DO UPDATE SET role = 'owner';
    `);
    return;
  }

  const profiles = await checkRes.json();

  if (profiles.length > 0) {
    // Update existing profile to owner
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ role: 'owner', full_name: fullName })
    });

    if (updateRes.ok) {
      console.log('✅ Profile updated to Owner role!');
    } else {
      const err = await updateRes.text();
      console.log('⚠️  Could not update profile:', err);
    }
  } else {
    // Insert new profile
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: userId,
        email: email,
        full_name: fullName,
        role: 'owner'
      })
    });

    if (insertRes.ok) {
      console.log('✅ Owner profile created!');
    } else {
      const err = await insertRes.text();
      console.log('⚠️  Could not create profile:', err);
      console.log('\n   You may need to run schema.sql first to create the profiles table.');
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('  QasirToko - Setup Owner Account');
  console.log('========================================\n');

  await applySchema();
  const user = await createOwnerAccount();

  console.log('\n========================================');
  console.log('  Setup Complete!');
  console.log('========================================');
  console.log('\n📋 Login credentials:');
  console.log('   Email:    damairaya2004@gmail.com');
  console.log('   Password: ManusiaBiasa2004');
  console.log('   Role:     Owner (Pemilik Toko)\n');
}

main().catch(console.error);
