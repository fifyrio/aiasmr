#!/usr/bin/env node

/**
 * Test script for new KIE callback format
 * Tests both new format and legacy format support
 */

async function testNewFormatCallback() {
  console.log('🧪 Testing KIE callback - New Format (resultUrls)');
  
  const newFormatPayload = {
    code: 200,
    msg: "Veo3 视频生成成功。",
    data: {
      taskId: "veo_task_" + Date.now(),
      info: {
        resultUrls: ["http://example.com/new-format-video.mp4"],
        originUrls: ["http://example.com/new-format-original.mp4"]
      },
      fallbackFlag: false
    }
  };
  
  try {
    const response = await fetch('http://localhost:3001/api/kie-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFormatPayload)
    });
    
    const result = await response.json();
    console.log('✅ New format callback response:', result);
    console.log('   Status:', response.status);
    
  } catch (error) {
    console.error('❌ New format callback failed:', error.message);
  }
}

async function testLegacyFormatCallback() {
  console.log('\n🧪 Testing KIE callback - Legacy Format (video_url/image_url)');
  
  const legacyFormatPayload = {
    code: 200,
    msg: "success",
    data: {
      task_id: "legacy_task_" + Date.now(),
      video_id: "legacy_video_" + Math.random().toString(36).substr(2, 9),
      video_url: "http://example.com/legacy-video.mp4",
      image_url: "http://example.com/legacy-thumbnail.jpg"
    }
  };
  
  try {
    const response = await fetch('http://localhost:3001/api/kie-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(legacyFormatPayload)
    });
    
    const result = await response.json();
    console.log('✅ Legacy format callback response:', result);
    console.log('   Status:', response.status);
    
  } catch (error) {
    console.error('❌ Legacy format callback failed:', error.message);
  }
}

async function testStatusEndpoint(taskId) {
  console.log(`\n🧪 Testing status endpoint for task: ${taskId}`);
  
  try {
    const response = await fetch(`http://localhost:3001/api/generate/status?taskId=${taskId}`);
    const result = await response.json();
    
    console.log('📊 Status response:', result);
    console.log('   HTTP Status:', response.status);
    
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
  }
}

async function testCompleteFlow() {
  console.log('\n🔄 Testing complete video generation flow simulation');
  
  // Step 1: Simulate video generation request (would create database record)
  const taskId = "test_flow_" + Date.now();
  console.log('📝 Simulated task created:', taskId);
  
  // Step 2: Check initial status (should show 'pending' or 'not_found')
  await testStatusEndpoint(taskId);
  
  // Step 3: Simulate KIE callback with completion
  console.log('\n📨 Simulating KIE callback...');
  const callbackPayload = {
    code: 200,
    msg: "Veo3 视频生成成功。",
    data: {
      taskId: taskId,
      info: {
        resultUrls: ["http://example.com/flow-test-video.mp4"],
        originUrls: ["http://example.com/flow-test-original.mp4"]
      },
      fallbackFlag: false
    }
  };
  
  try {
    const callbackResponse = await fetch('http://localhost:3001/api/kie-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callbackPayload)
    });
    
    console.log('✅ Callback sent, status:', callbackResponse.status);
    
    // Step 4: Check status after callback (should show 'completed')
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
    await testStatusEndpoint(taskId);
    
  } catch (error) {
    console.error('❌ Complete flow test failed:', error.message);
  }
}

async function main() {
  console.log('🔄 New KIE Callback Format Test Suite');
  console.log('=====================================\n');
  
  try {
    // Test server is running
    const healthCheck = await fetch('http://localhost:3001/api/kie-callback', {
      method: 'GET'
    });
    
    if (healthCheck.status === 405) {
      console.log('✅ Server is running and callback endpoint exists\n');
    } else {
      console.log('⚠️ Unexpected response from callback endpoint\n');
    }
  } catch (error) {
    console.error('❌ Server not running. Please start with: npm run dev');
    process.exit(1);
  }
  
  // Run all test scenarios
  await testNewFormatCallback();
  await testLegacyFormatCallback();
  await testCompleteFlow();
  
  console.log('\n✅ All new format callback tests completed!');
  console.log('📝 Check your server logs to see the detailed callback processing.');
  console.log('🎯 Key improvements:');
  console.log('   - Status checking now uses local database instead of KIE API');
  console.log('   - Callback supports both new resultUrls format and legacy format');
  console.log('   - No more direct polling to KIE API endpoints');
}

main().catch(console.error);