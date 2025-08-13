#!/usr/bin/env node

/**
 * Migration script to add task_id and related columns to videos table
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function runMigration() {
  console.log('🔧 Running database migration to add task_id column...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase configuration in .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  // Create Supabase client with service role key (has admin privileges)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Read migration SQL
  const migrationPath = path.join(__dirname, '..', 'migrations', 'add_task_id_to_videos.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log('📄 Migration SQL loaded');
  
  // Split SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  console.log(`🔄 Executing ${statements.length} migration statements...`);
  
  try {
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`📝 Executing statement ${i + 1}/${statements.length}:`);
      console.log(`   ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        throw error;
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`);
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify the columns were added
    console.log('🔍 Verifying migration...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'videos')
      .eq('table_schema', 'public')
      .in('column_name', ['task_id', 'error_message', 'video_id']);
    
    if (columnsError) {
      console.error('❌ Error verifying migration:', columnsError);
    } else {
      console.log('✅ New columns added successfully:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // Check indexes
    const { data: indexes, error: indexError } = await supabase
      .from('pg_indexes')
      .select('indexname, indexdef')
      .eq('tablename', 'videos')
      .like('indexname', '%task_id%');
    
    if (!indexError && indexes.length > 0) {
      console.log('✅ Indexes created successfully:');
      indexes.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative method using raw SQL execution
async function runMigrationRaw() {
  console.log('🔧 Running database migration using raw SQL...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase configuration');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Add task_id column
    console.log('📝 Adding task_id column...');
    let { error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS task_id text;' 
    });
    if (error) throw error;
    
    // Add error_message column  
    console.log('📝 Adding error_message column...');
    ({ error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS error_message text;' 
    }));
    if (error) throw error;
    
    // Add video_id column
    console.log('📝 Adding video_id column...');
    ({ error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS video_id text;' 
    }));
    if (error) throw error;
    
    // Add index for task_id
    console.log('📝 Creating task_id index...');
    ({ error } = await supabase.rpc('exec_sql', { 
      sql: 'CREATE INDEX IF NOT EXISTS idx_videos_task_id ON public.videos(task_id);' 
    }));
    if (error) throw error;
    
    // Add unique constraint
    console.log('📝 Adding unique constraint...');
    ({ error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE public.videos ADD CONSTRAINT IF NOT EXISTS videos_task_id_unique UNIQUE (task_id);' 
    }));
    if (error) throw error;
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Check if exec_sql function exists, if not use alternative approach
async function checkAndRunMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Test if exec_sql function exists
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    
    if (error && error.message.includes('function "exec_sql" does not exist')) {
      console.log('⚠️ exec_sql function not available, using alternative migration method');
      console.log('');
      console.log('🔧 Manual Migration Required');
      console.log('=========================');
      console.log('Please execute the following SQL in your Supabase SQL Editor:');
      console.log('');
      
      const migrationPath = path.join(__dirname, '..', 'migrations', 'add_task_id_to_videos.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log(migrationSQL);
      console.log('');
      console.log('Or visit: https://supabase.com/dashboard/project/xwthsruuafryyqspqyss/sql');
      
    } else {
      await runMigration();
    }
    
  } catch (error) {
    console.error('❌ Error checking migration capability:', error);
    console.log('');
    console.log('🔧 Manual Migration Required');
    console.log('=========================');
    console.log('Please execute the migration SQL manually in Supabase dashboard.');
  }
}

checkAndRunMigration().catch(console.error);