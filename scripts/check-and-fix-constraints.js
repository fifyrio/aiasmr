/**
 * Check and fix database constraints
 * This script checks for any constraints referencing the non-existent 'profiles' table
 * and provides the SQL commands to fix them.
 */

const { createClient } = require('@supabase/supabase-js');

async function checkAndFixConstraints() {
  try {
    console.log('🔍 Checking database constraints...');

    // Initialize Supabase client (you'll need to set environment variables)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('⚠️  Environment variables not set. Please run the SQL commands manually.');
      console.log('');
      console.log('📋 SQL Commands to run in Supabase SQL Editor:');
      console.log('');
      printSQLCommands();
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check current foreign key constraints on videos table
    console.log('📊 Checking current constraints on videos table...');
    
    const { data: constraints, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'videos'
          AND tc.table_schema = 'public';
      `
    });

    if (error) {
      console.error('❌ Error checking constraints:', error);
      console.log('');
      console.log('📋 Please run these SQL commands manually in Supabase SQL Editor:');
      console.log('');
      printSQLCommands();
      return;
    }

    console.log('Current constraints found:', constraints);

    // If we find any constraints referencing 'profiles', we need to fix them
    const problemConstraints = constraints?.filter(c => c.foreign_table_name === 'profiles') || [];

    if (problemConstraints.length > 0) {
      console.log(`⚠️  Found ${problemConstraints.length} constraints referencing 'profiles' table`);
      console.log('📋 Please run these SQL commands in Supabase SQL Editor:');
      console.log('');
      printSQLCommands();
    } else {
      console.log('✅ No problematic constraints found.');
      
      // Test if we can insert a video record now
      console.log('🧪 Testing video insertion...');
      await testVideoInsertion(supabase);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('');
    console.log('📋 Please run these SQL commands manually in Supabase SQL Editor:');
    console.log('');
    printSQLCommands();
  }
}

function printSQLCommands() {
  console.log(`-- Fix videos table foreign key constraints
-- Run this in Supabase SQL Editor

-- 1. First, check what constraints exist
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'videos'
  AND tc.table_schema = 'public';

-- 2. Drop any existing foreign key constraints on videos.user_id
DO $$ 
DECLARE 
    constraint_rec RECORD;
BEGIN
    -- Find and drop all foreign key constraints on videos.user_id
    FOR constraint_rec IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'videos'
          AND tc.table_schema = 'public'
          AND kcu.column_name = 'user_id'
    LOOP
        EXECUTE format('ALTER TABLE public.videos DROP CONSTRAINT %I', constraint_rec.constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_rec.constraint_name;
    END LOOP;
END $$;

-- 3. Add the correct constraint
ALTER TABLE public.videos 
ADD CONSTRAINT videos_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- 4. Verify the fix
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'videos'
  AND kcu.column_name = 'user_id'
  AND tc.table_schema = 'public';`);
}

async function testVideoInsertion(supabase) {
  try {
    const testData = {
      title: 'Test Video',
      prompt: 'Test prompt',
      triggers: ['test'],
      category: 'Object',
      credit_cost: 1,
      user_id: null // Test with null user_id first
    };

    const { data, error } = await supabase
      .from('videos')
      .insert(testData)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Test insertion failed:', error);
      return false;
    }

    console.log('✅ Test insertion successful!');
    
    // Clean up test record
    if (data?.id) {
      await supabase
        .from('videos')
        .delete()
        .eq('id', data.id);
      console.log('🧹 Test record cleaned up');
    }

    return true;
  } catch (error) {
    console.error('❌ Test insertion error:', error);
    return false;
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkAndFixConstraints();
}

module.exports = { checkAndFixConstraints };