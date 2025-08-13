#!/usr/bin/env node

/**
 * Test script to simulate KIE API callbacks
 * This simulates both success and failure callbacks
 */

async function testSuccessCallback() {
  console.log('🧪 Testing KIE callback - Success scenario');
  
  const successPayload = {
    code: 200,
    msg: "success",
    data: {
      task_id: "test-task-" + Date.now(),
      video_id: "video_" + Math.random().toString(36).substr(2, 9),
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
      body: JSON.stringify(successPayload)
    });
    
    const result = await response.json();
    console.log('✅ Success callback response:', result);
    console.log('   Status:', response.status);
    
  } catch (error) {
    console.error('❌ Success callback failed:', error.message);
  }
}

async function testFailureCallback() {
  console.log('\n🧪 Testing KIE callback - Failure scenario');
  
  const failurePayload = {
    code: 400,
    msg: "Inappropriate content detected. Please replace the image or video.",
    data: {
      task_id: "test-task-fail-" + Date.now(),
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
    console.log('✅ Failure callback response:', result);
    console.log('   Status:', response.status);
    
  } catch (error) {
    console.error('❌ Failure callback failed:', error.message);
  }
}

async function testServerErrorCallback() {
  console.log('\n🧪 Testing KIE callback - Server Error scenario');
  
  const serverErrorPayload = {
    code: 500,
    msg: "Internal server error during video generation",
    data: {
      task_id: "test-task-server-error-" + Date.now(),
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
      body: JSON.stringify(serverErrorPayload)
    });
    
    const result = await response.json();
    console.log('✅ Server error callback response:', result);
    console.log('   Status:', response.status);
    
  } catch (error) {
    console.error('❌ Server error callback failed:', error.message);
  }
}

async function testQuotaLimitCallback() {
  console.log('\n🧪 Testing KIE callback - Quota Limit scenario');
  
  const quotaLimitPayload = {
    code: 400,
    msg: "Reached the limit for concurrent generations.",
    data: {
      task_id: "test-task-quota-" + Date.now(),
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
      body: JSON.stringify(quotaLimitPayload)
    });
    
    const result = await response.json();
    console.log('✅ Quota limit callback response:', result);
    console.log('   Status:', response.status);
    
  } catch (error) {
    console.error('❌ Quota limit callback failed:', error.message);
  }
}

async function testInvalidCallback() {
  console.log('\n🧪 Testing KIE callback - Invalid JSON scenario');
  
  try {
    const response = await fetch('http://localhost:3001/api/kie-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json'
    });
    
    const result = await response.json();
    console.log('✅ Invalid JSON callback response:', result);
    console.log('   Status:', response.status);
    
  } catch (error) {
    console.error('❌ Invalid JSON callback failed:', error.message);
  }
}

async function main() {
  console.log('🔄 KIE Callback Test Suite');
  console.log('========================\n');
  
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
  await testSuccessCallback();
  await testFailureCallback();
  await testServerErrorCallback();
  await testQuotaLimitCallback();
  await testInvalidCallback();
  
  console.log('\n✅ All callback tests completed!');
  console.log('📝 Check your server logs to see the detailed callback processing.');
}

main().catch(console.error);