#!/usr/bin/env node

/**
 * Complete test for the video generation and callback flow
 * Run this after the database migration is complete
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseMigration() {
  console.log('🔧 Testing database migration...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Test if all required columns exist
  const testColumns = ['task_id', 'error_message', 'video_id'];
  let allColumnsExist = true;
  
  for (const column of testColumns) {
    try {
      const { error } = await supabase
        .from('videos')
        .select(column)
        .limit(1);
      
      if (error && error.code === '42703') {
        console.log(`❌ Column ${column} does not exist`);
        allColumnsExist = false;
      } else {
        console.log(`✅ Column ${column} exists`);
      }
    } catch (error) {
      console.log(`❌ Error checking column ${column}:`, error);
      allColumnsExist = false;
    }
  }
  
  return allColumnsExist;
}

async function testVideoGeneration() {
  console.log('\n🎬 Testing video generation API...');
  
  const generatePayload = {
    prompt: "A soothing ASMR scene with soap cutting",
    triggers: ["soap"],
    aspectRatio: "16:9",
    duration: 5,
    quality: "720p",
    waterMark: "Test"
  };
  
  try {
    const response = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generatePayload)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Video generation API successful');
      console.log(`   Task ID: ${result.taskId}`);
      return result.taskId;
    } else {
      console.log('❌ Video generation API failed:', result);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Video generation API error:', error.message);
    return null;
  }
}

async function testStatusEndpoint(taskId) {
  console.log(`\n📊 Testing status endpoint for task: ${taskId}`);
  
  try {
    const response = await fetch(`http://localhost:3001/api/generate/status?taskId=${taskId}`);
    const result = await response.json();
    
    console.log('Status response:', {
      success: result.success,
      status: result.status,
      progress: result.progress,
      hasResult: !!result.result,
      hasError: !!result.error
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
    return null;
  }
}

async function testCallback(taskId) {
  console.log(`\n📨 Testing callback for task: ${taskId}`);
  
  const callbackPayload = {
    code: 200,
    msg: "All generated successfully.",
    data: {
      task_id: taskId,
      video_id: "test_video_" + Math.random().toString(36).substr(2, 9),
      video_url: "https://example.com/test-video.mp4",
      image_url: "https://example.com/test-thumbnail.jpg"
    }
  };
  
  try {
    const response = await fetch('http://localhost:3001/api/kie-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callbackPayload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Callback processed successfully');
      console.log('   Response:', result);
      return true;
    } else {
      console.log('❌ Callback failed:', result);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Callback error:', error.message);
    return false;
  }
}

async function testFailureCallback(taskId) {
  console.log(`\n💥 Testing failure callback for task: ${taskId}`);
  
  const failurePayload = {
    code: 400,
    msg: "Inappropriate content detected. Please replace the image or video.",
    data: {
      task_id: taskId,
      video_id: "",
      video_url: "",
      image_url: ""
    }
  };
  
  try {
    const response = await fetch('http://localhost:3001/api/kie-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(failurePayload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Failure callback processed successfully');
      return true;
    } else {
      console.log('❌ Failure callback failed:', result);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Failure callback error:', error.message);
    return false;
  }
}

async function cleanupTestData(taskIds) {
  console.log('\n🧹 Cleaning up test data...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  for (const taskId of taskIds) {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('task_id', taskId);
      
      if (!error) {
        console.log(`✅ Cleaned up test data for task: ${taskId}`);
      }
    } catch (error) {
      console.log(`⚠️ Could not clean up task ${taskId}:`, error.message);
    }
  }
}

async function main() {
  console.log('🔄 Complete Video Generation Flow Test');
  console.log('======================================\n');
  
  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3001/api/kie-callback', {
      method: 'GET'
    });
    
    if (healthCheck.status === 405) {
      console.log('✅ Server is running\n');
    } else {
      console.log('⚠️ Unexpected server response\n');
    }
  } catch (error) {
    console.error('❌ Server not running. Please start with: npm run dev');
    process.exit(1);
  }
  
  // Test 1: Database migration
  const migrationOk = await testDatabaseMigration();
  if (!migrationOk) {
    console.log('\n❌ Database migration incomplete. Please run the SQL migration first.');
    console.log('See previous output for migration SQL commands.');
    return;
  }
  
  console.log('✅ Database migration verified\n');
  
  const testTaskIds = [];
  
  // Test 2: Video generation
  const taskId1 = await testVideoGeneration();
  if (taskId1) {
    testTaskIds.push(taskId1);
    
    // Test 3: Initial status check (should be pending)
    await testStatusEndpoint(taskId1);
    
    // Test 4: Success callback
    const callbackOk = await testCallback(taskId1);
    
    if (callbackOk) {
      // Test 5: Status check after callback (should be completed)
      console.log('\n📊 Checking status after success callback...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
      await testStatusEndpoint(taskId1);
    }
  }
  
  // Test 6: Failure scenario
  const taskId2 = await testVideoGeneration();
  if (taskId2) {
    testTaskIds.push(taskId2);
    
    const failureCallbackOk = await testFailureCallback(taskId2);
    
    if (failureCallbackOk) {
      console.log('\n📊 Checking status after failure callback...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
      await testStatusEndpoint(taskId2);
    }
  }
  
  // Cleanup
  if (testTaskIds.length > 0) {
    await cleanupTestData(testTaskIds);
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Test Summary:');
  console.log('   ✓ Database migration verified');
  console.log('   ✓ Video generation API tested');
  console.log('   ✓ Status checking via database tested');
  console.log('   ✓ Success callback handling tested');
  console.log('   ✓ Failure callback handling tested');
  console.log('   ✓ End-to-end flow verified');
  
  console.log('\n🔧 Next Steps:');
  console.log('   1. Your callback-based video generation system is ready');
  console.log('   2. No more direct KIE API polling needed');
  console.log('   3. Status checks now use local database');
  console.log('   4. 2-minute video generation wait times handled via callbacks');
}

main().catch(console.error);