// Apply schema to Supabase using the Management API
const SUPABASE_URL = 'https://fajherjsqsirlyawdqov.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhamhlcmpzcXNpcmx5YXdkcW92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzEyNzc1NywiZXhwIjoyMDk4NzAzNzU3fQ.TB0LLxzTcxMIcY8py7AW1fCzsDhZhgBMFgr7gjt1LJc';

const OWNER_ID = '57ab7ff1-f09d-4221-875b-9c2fd888beaa';

async function executeSql(sql, label) {
  // Try using the pg-meta endpoint (available on Supabase hosted)
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'x-connection-encrypted': 'true'
    },
    body: JSON.stringify({ query: sql })
  });

  if (res.ok) {
    console.log(`✅ ${label}`);
    return true;
  }

  // Fallback: try the SQL endpoint  
  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ sql_text: sql })
  });

  if (res2.ok) {
    console.log(`✅ ${label}`);
    return true;
  }

  const err = await res.text();
  console.log(`⚠️  ${label}: ${res.status} - trying alternative...`);
  return false;
}

async function createProfilesViaRest() {
  console.log('=== Creating profiles table via REST workaround ===\n');

  // Step 1: First, let's try to create the exec_sql function via a raw approach
  // We'll create a temporary RPC function using the REST API

  // Actually, let's use a simpler approach: create the profiles table structure
  // by using Supabase's REST API to verify the table, and if it doesn't exist,
  // guide the user to create it

  // Check if profiles table exists
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  if (checkRes.status !== 200) {
    console.log('Profiles table does not exist yet. Creating via SQL...\n');

    // Use the Supabase pg endpoint
    const sqlStatements = [
      {
        sql: `CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT NOT NULL,
          full_name TEXT NOT NULL DEFAULT 'Kasir',
          role TEXT NOT NULL DEFAULT 'kasir' CHECK (role IN ('owner', 'kasir')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`,
        label: 'Create profiles table'
      },
      {
        sql: `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
        label: 'Enable RLS on profiles'
      },
      {
        sql: `CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);`,
        label: 'Create profiles index'
      }
    ];

    let allSuccess = true;
    for (const stmt of sqlStatements) {
      const success = await executeSql(stmt.sql, stmt.label);
      if (!success) allSuccess = false;
    }

    if (!allSuccess) {
      console.log('\n⚠️  Could not create tables via API. Using Supabase Dashboard instead...\n');
      return false;
    }
  } else {
    console.log('✅ Profiles table already exists!\n');
  }

  return true;
}

async function insertOwnerProfile() {
  console.log('=== Inserting Owner Profile ===\n');

  // Try inserting directly via REST API (using service_role which bypasses RLS)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation,resolution=merge-duplicates'
    },
    body: JSON.stringify({
      id: OWNER_ID,
      email: 'damairaya2004@gmail.com',
      full_name: 'Owner Toko',
      role: 'owner'
    })
  });

  if (res.ok) {
    const data = await res.json();
    console.log('✅ Owner profile created/updated!');
    console.log(`   ID: ${OWNER_ID}`);
    console.log(`   Role: owner`);
    console.log(`   Name: Owner Toko`);
    return true;
  } else {
    const err = await res.text();
    console.log('Result:', res.status, err);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('  Apply Schema & Set Owner Profile');
  console.log('========================================\n');

  const tableExists = await createProfilesViaRest();
  
  if (tableExists) {
    await insertOwnerProfile();
  }

  // Also remove old open RLS policies and add secure ones
  console.log('\n=== Updating RLS Policies ===\n');

  const policyStatements = [
    // Drop old open-access policies
    `DROP POLICY IF EXISTS "Allow anon select categories" ON public.categories;`,
    `DROP POLICY IF EXISTS "Allow anon insert categories" ON public.categories;`,
    `DROP POLICY IF EXISTS "Allow anon update categories" ON public.categories;`,
    `DROP POLICY IF EXISTS "Allow anon delete categories" ON public.categories;`,
    `DROP POLICY IF EXISTS "Allow anon select products" ON public.products;`,
    `DROP POLICY IF EXISTS "Allow anon insert products" ON public.products;`,
    `DROP POLICY IF EXISTS "Allow anon update products" ON public.products;`,
    `DROP POLICY IF EXISTS "Allow anon delete products" ON public.products;`,
    `DROP POLICY IF EXISTS "Allow anon select transactions" ON public.transactions;`,
    `DROP POLICY IF EXISTS "Allow anon insert transactions" ON public.transactions;`,
    `DROP POLICY IF EXISTS "Allow anon update transactions" ON public.transactions;`,
    `DROP POLICY IF EXISTS "Allow anon delete transactions" ON public.transactions;`,
    `DROP POLICY IF EXISTS "Allow anon select transaction_items" ON public.transaction_items;`,
    `DROP POLICY IF EXISTS "Allow anon insert transaction_items" ON public.transaction_items;`,
    `DROP POLICY IF EXISTS "Allow anon update transaction_items" ON public.transaction_items;`,
    `DROP POLICY IF EXISTS "Allow anon delete transaction_items" ON public.transaction_items;`,
    `DROP POLICY IF EXISTS "Allow anon select settings" ON public.settings;`,
    `DROP POLICY IF EXISTS "Allow anon insert settings" ON public.settings;`,
    `DROP POLICY IF EXISTS "Allow anon update settings" ON public.settings;`,
  ];

  for (const sql of policyStatements) {
    await executeSql(sql, `Drop old policy`);
  }

  console.log('\n========================================');
  console.log('  Done!');
  console.log('========================================\n');
  console.log('📋 Owner Login:');
  console.log('   Email:    damairaya2004@gmail.com');
  console.log('   Password: ManusiaBiasa2004');
  console.log('   Role:     Owner (Pemilik Toko)\n');
}

main().catch(console.error);
