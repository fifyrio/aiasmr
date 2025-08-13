/**
 * Fix database constraints - specifically the videos table user_id foreign key
 * This script fixes the constraint that references non-existent 'profiles' table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function fixDatabaseConstraints() {
  try {
    console.log('🔧 Starting database constraint fix...');

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read the SQL migration file
    const migrationFile = path.join(__dirname, '../migrations/fix_videos_user_id_constraint.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

    console.log('📋 Executing constraint fix migration...');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach - execute parts separately
      console.log('🔄 Trying alternative approach...');
      
      // First check current constraints
      const { data: constraints } = await supabase
        .from('information_schema.table_constraints')
        .select('*')
        .eq('table_name', 'videos')
        .eq('constraint_type', 'FOREIGN KEY');
      
      console.log('Current constraints on videos table:', constraints);
      
      throw error;
    }

    console.log('✅ Database constraint fix completed successfully!');
    console.log('Data:', data);

    // Verify the fix by testing a simple insert
    console.log('🧪 Testing database fix...');
    
    // This should not fail anymore
    const testData = {
      title: 'Test Video',
      prompt: 'Test prompt',
      triggers: ['test'],
      category: 'Object',
      credit_cost: 1,
      user_id: null // Test with null user_id
    };

    const { data: testResult, error: testError } = await supabase
      .from('videos')
      .insert(testData)
      .select('id')
      .single();

    if (testError) {
      console.error('❌ Test insert failed:', testError);
      throw testError;
    }

    console.log('✅ Test insert successful:', testResult);

    // Clean up test record
    if (testResult?.id) {
      await supabase
        .from('videos')
        .delete()
        .eq('id', testResult.id);
      console.log('🧹 Test record cleaned up');
    }

    console.log('🎉 Database constraint fix completed and verified!');

  } catch (error) {
    console.error('❌ Failed to fix database constraints:', error);
    process.exit(1);
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixDatabaseConstraints();
}

module.exports = { fixDatabaseConstraints };