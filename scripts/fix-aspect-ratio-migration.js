#!/usr/bin/env node

/**
 * Migration script to add missing aspect_ratio and related columns to videos table
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

async function runAspectRatioMigration() {
  console.log('🔧 Running database migration to add aspect_ratio and related columns...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('');
    console.log('🔧 Manual Migration Required');
    console.log('=========================');
    console.log('Please execute the following SQL in your Supabase SQL Editor:');
    console.log('');
    
    const migrationPath = path.join(__dirname, '..', 'migrations', 'fix_aspect_ratio_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
    console.log('');
    console.log('Or visit: https://supabase.com/dashboard/project/your-project/sql');
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    console.log('📝 Adding aspect_ratio column...');
    let { error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS aspect_ratio text DEFAULT \'16:9\';' 
    });
    if (error && !error.message.includes('already exists')) {
      console.log('Note: aspect_ratio column may already exist or exec_sql unavailable');
    }
    
    console.log('📝 Adding enhanced_prompt column...');
    ({ error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS enhanced_prompt text;' 
    }));
    if (error && !error.message.includes('already exists')) {
      console.log('Note: enhanced_prompt column may already exist or exec_sql unavailable');
    }
    
    console.log('📝 Adding provider column...');
    ({ error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS provider text DEFAULT \'kie-runway\';' 
    }));
    if (error && !error.message.includes('already exists')) {
      console.log('Note: provider column may already exist or exec_sql unavailable');
    }
    
    console.log('📝 Adding image_url column...');
    ({ error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS image_url text;' 
    }));
    if (error && !error.message.includes('already exists')) {
      console.log('Note: image_url column may already exist or exec_sql unavailable');
    }
    
    console.log('📝 Adding quality column...');
    ({ error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS quality text DEFAULT \'720p\';' 
    }));
    if (error && !error.message.includes('already exists')) {
      console.log('Note: quality column may already exist or exec_sql unavailable');
    }
    
    console.log('🎉 Migration completed! If you see notes above, please run the SQL manually.');
    
  } catch (error) {
    console.error('❌ Automatic migration failed:', error);
    console.log('');
    console.log('🔧 Manual Migration Required');
    console.log('=========================');
    console.log('Please execute the following SQL in your Supabase SQL Editor:');
    console.log('');
    
    const migrationPath = path.join(__dirname, '..', 'migrations', 'fix_aspect_ratio_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
  }
}

runAspectRatioMigration().catch(console.error);