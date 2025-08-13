const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function runSimpleMigration() {
  console.log('🔧 Running simple database migration...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase configuration');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  console.log('📊 Testing database connection...');
  
  // Test connection by querying existing videos table
  const { data: testData, error: testError } = await supabase
    .from('videos')
    .select('id')
    .limit(1);
  
  if (testError) {
    console.error('❌ Database connection failed:', testError);
    process.exit(1);
  }
  
  console.log('✅ Database connection successful');
  
  // Check if task_id column already exists
  console.log('🔍 Checking if task_id column exists...');
  
  // Try to select task_id column to see if it exists
  const { data: columnTest, error: columnError } = await supabase
    .from('videos')
    .select('task_id')
    .limit(1);
  
  if (columnError && columnError.code === '42703') {
    console.log('📝 task_id column does not exist, manual migration needed');
    console.log('');
    console.log('🔧 MANUAL MIGRATION REQUIRED');
    console.log('============================');
    console.log('Please execute the following SQL in your Supabase SQL Editor:');
    console.log('');
    console.log('-- Add task_id column to videos table');
    console.log('ALTER TABLE public.videos ADD COLUMN task_id text;');
    console.log('');
    console.log('-- Add error_message column');
    console.log('ALTER TABLE public.videos ADD COLUMN error_message text;');
    console.log('');
    console.log('-- Add video_id column');
    console.log('ALTER TABLE public.videos ADD COLUMN video_id text;');
    console.log('');
    console.log('-- Add index for task_id');
    console.log('CREATE INDEX idx_videos_task_id ON public.videos(task_id);');
    console.log('');
    console.log('-- Add unique constraint for task_id');
    console.log('ALTER TABLE public.videos ADD CONSTRAINT videos_task_id_unique UNIQUE (task_id);');
    console.log('');
    console.log('Visit: https://supabase.com/dashboard/project/xwthsruuafryyqspqyss/sql');
    console.log('');
    console.log('After running the migration, you can test the status endpoint again.');
    
  } else if (columnError) {
    console.error('❌ Error checking column:', columnError);
  } else {
    console.log('✅ task_id column already exists!');
    
    // Test the status endpoint flow now
    console.log('🧪 Testing status endpoint with mock task...');
    
    // Create a test video record
    const testTaskId = 'test_migration_' + Date.now();
    
    const { data: insertData, error: insertError } = await supabase
      .from('videos')
      .insert({
        title: 'Migration Test Video',
        description: 'Test video for migration verification',
        prompt: 'Test prompt',
        triggers: ['soap'],
        category: 'Object',
        credit_cost: 1,
        task_id: testTaskId,
        status: 'processing'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error creating test video:', insertError);
    } else {
      console.log('✅ Test video created:', insertData.id);
      
      // Test querying by task_id
      const { data: queryData, error: queryError } = await supabase
        .from('videos')
        .select('*')
        .eq('task_id', testTaskId)
        .single();
      
      if (queryError) {
        console.error('❌ Error querying by task_id:', queryError);
      } else {
        console.log('✅ Successfully queried video by task_id');
        console.log('   Video ID:', queryData.id);
        console.log('   Task ID:', queryData.task_id);
        console.log('   Status:', queryData.status);
        
        // Clean up test record
        await supabase
          .from('videos')
          .delete()
          .eq('id', queryData.id);
        
        console.log('✅ Test record cleaned up');
      }
    }
  }
}

runSimpleMigration().catch(console.error);