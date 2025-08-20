#!/usr/bin/env node

/**
 * Video Generation Workflow Test Script
 * Tests the complete video generation pipeline including:
 * - User authentication
 * - Credit management
 * - Video generation request
 * - Status polling
 * - Error handling
 */

const axios = require('axios');
const readline = require('readline');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!'
};

const testVideo = {
  prompt: 'ASMR soap cutting video with satisfying sounds and smooth movements',
  triggers: ['soap', 'cutting'],
  duration: 5,
  quality: '720p',
  aspectRatio: '16:9'
};

let authToken = null;
let userId = null;

/**
 * Create axios instance with auth
 */
const createApiClient = () => {
  return axios.create({
    baseURL: API_BASE,
    headers: authToken ? {
      'Authorization': `Bearer ${authToken}`
    } : {},
    timeout: 30000
  });
};

/**
 * Test user registration
 */
async function testUserRegistration() {
  log('\n🔐 Testing User Registration...', 'cyan');
  
  try {
    const api = createApiClient();
    const response = await api.post('/auth/register', testUser);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      userId = response.data.data.user.id;
      
      log(`✅ User registered successfully`, 'green');
      log(`   User ID: ${userId}`, 'blue');
      log(`   Email: ${testUser.email}`, 'blue');
      log(`   Credits: ${response.data.data.user.credits}`, 'blue');
      
      return true;
    } else {
      log(`❌ Registration failed: ${response.data.error?.message}`, 'red');
      return false;
    }
    
  } catch (error) {
    log(`❌ Registration error: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Test user login (alternative to registration)
 */
async function testUserLogin() {
  log('\n🔐 Testing User Login...', 'cyan');
  
  try {
    const api = createApiClient();
    const response = await api.post('/auth/login', {
      email: 'existing@example.com',
      password: 'ExistingPassword123!'
    });
    
    if (response.data.success) {
      authToken = response.data.data.token;
      userId = response.data.data.user.id;
      
      log(`✅ User logged in successfully`, 'green');
      log(`   User ID: ${userId}`, 'blue');
      log(`   Credits: ${response.data.data.user.credits}`, 'blue');
      
      return true;
    } else {
      log(`❌ Login failed: ${response.data.error?.message}`, 'red');
      return false;
    }
    
  } catch (error) {
    log(`❌ Login error: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Test credit balance check
 */
async function testCreditBalance() {
  log('\n💰 Testing Credit Balance Check...', 'cyan');
  
  try {
    const api = createApiClient();
    const response = await api.get('/credits/balance');
    
    if (response.data.success) {
      const balance = response.data.data.balance;
      log(`✅ Credit balance retrieved: ${balance} credits`, 'green');
      
      if (balance < 20) {
        log(`⚠️  Insufficient credits for video generation (need 20, have ${balance})`, 'yellow');
        return false;
      }
      
      return true;
    } else {
      log(`❌ Failed to get credit balance`, 'red');
      return false;
    }
    
  } catch (error) {
    log(`❌ Credit balance error: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Test video generation request
 */
async function testVideoGeneration() {
  log('\n🎬 Testing Video Generation Request...', 'cyan');
  log(`   Prompt: ${testVideo.prompt}`, 'blue');
  log(`   Triggers: ${testVideo.triggers.join(', ')}`, 'blue');
  log(`   Duration: ${testVideo.duration}s`, 'blue');
  log(`   Quality: ${testVideo.quality}`, 'blue');
  
  try {
    const api = createApiClient();
    const response = await api.post('/generate', testVideo);
    
    if (response.data.success) {
      const data = response.data.data;
      log(`✅ Video generation started successfully`, 'green');
      log(`   Task ID: ${data.taskId}`, 'blue');
      log(`   Status: ${data.status}`, 'blue');
      log(`   Credits Deducted: ${data.creditsDeducted}`, 'blue');
      log(`   Remaining Credits: ${data.remainingCredits}`, 'blue');
      log(`   Estimated Time: ${data.estimatedTime}s`, 'blue');
      
      return data.taskId;
    } else {
      log(`❌ Video generation failed: ${response.data.error?.message}`, 'red');
      return null;
    }
    
  } catch (error) {
    log(`❌ Video generation error: ${error.response?.data?.error?.message || error.message}`, 'red');
    return null;
  }
}

/**
 * Test status polling
 */
async function testStatusPolling(taskId, maxPolls = 20) {
  log(`\n📊 Testing Status Polling for Task: ${taskId}...`, 'cyan');
  
  let polls = 0;
  
  while (polls < maxPolls) {
    try {
      const api = createApiClient();
      const response = await api.get(`/generate/status/${taskId}`);
      
      if (response.data.success) {
        const data = response.data.data;
        const status = data.status;
        const progress = data.progress || 0;
        
        log(`   Poll ${polls + 1}: ${status} (${progress}%)`, 'blue');
        
        if (status === 'completed') {
          log(`✅ Video generation completed successfully!`, 'green');
          log(`   Video URL: ${data.result?.videoUrl || 'N/A'}`, 'green');
          log(`   Thumbnail URL: ${data.result?.thumbnailUrl || 'N/A'}`, 'green');
          
          if (data.video) {
            log(`   Video ID: ${data.video.id}`, 'blue');
            log(`   File Size: ${data.video.fileSize || 'N/A'} bytes`, 'blue');
          }
          
          return true;
        }
        
        if (status === 'failed') {
          log(`❌ Video generation failed: ${data.error || 'Unknown error'}`, 'red');
          return false;
        }
        
        if (status === 'processing' || status === 'pending') {
          log(`   Estimated time remaining: ${data.estimatedTimeRemaining || 'N/A'}s`, 'yellow');
        }
        
      } else {
        log(`❌ Status check failed: ${response.data.error?.message}`, 'red');
        return false;
      }
      
    } catch (error) {
      log(`❌ Status polling error: ${error.response?.data?.error?.message || error.message}`, 'red');
      return false;
    }
    
    polls++;
    
    // Wait 5 seconds before next poll
    if (polls < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  log(`⚠️  Status polling timeout after ${maxPolls} attempts`, 'yellow');
  return false;
}

/**
 * Test video listing
 */
async function testVideoListing() {
  log('\n📋 Testing Video Listing...', 'cyan');
  
  try {
    const api = createApiClient();
    const response = await api.get('/videos?page=1&limit=5');
    
    if (response.data.success) {
      const videos = response.data.data.videos;
      const pagination = response.data.data.pagination;
      
      log(`✅ Retrieved ${videos.length} videos`, 'green');
      log(`   Total videos: ${pagination.total}`, 'blue');
      log(`   Current page: ${pagination.page}`, 'blue');
      
      if (videos.length > 0) {
        const latestVideo = videos[0];
        log(`   Latest video: ${latestVideo.title} (${latestVideo.status})`, 'blue');
      }
      
      return true;
    } else {
      log(`❌ Failed to list videos`, 'red');
      return false;
    }
    
  } catch (error) {
    log(`❌ Video listing error: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Test health check
 */
async function testHealthCheck() {
  log('\n🏥 Testing Health Check...', 'cyan');
  
  try {
    const response = await axios.get(`${API_BASE}/health/detailed`, {
      timeout: 10000
    });
    
    log(`✅ Health check successful`, 'green');
    log(`   Overall status: ${response.data.overall}`, 'blue');
    log(`   Database: ${response.data.services?.database || 'N/A'}`, 'blue');
    log(`   KIE API: ${response.data.services?.kieApi || 'N/A'}`, 'blue');
    log(`   R2 Storage: ${response.data.services?.r2Storage || 'N/A'}`, 'blue');
    
    return response.data.overall === 'healthy';
    
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Interactive test runner
 */
async function runInteractiveTest() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

  log('🧪 AI ASMR Video Generation API Test Suite', 'cyan');
  log('==========================================\n');

  // Health check first
  await testHealthCheck();

  const useExisting = await question('\nUse existing user for testing? (y/N): ');
  
  let authSuccess = false;
  if (useExisting.toLowerCase() === 'y') {
    authSuccess = await testUserLogin();
  } else {
    authSuccess = await testUserRegistration();
  }

  if (!authSuccess) {
    log('\n❌ Authentication failed. Cannot continue with tests.', 'red');
    rl.close();
    return;
  }

  // Test credit balance
  const hasCredits = await testCreditBalance();
  
  if (!hasCredits) {
    const continueAnyway = await question('\nContinue with video generation test anyway? (y/N): ');
    if (continueAnyway.toLowerCase() !== 'y') {
      log('\n⏹️  Test suite stopped.', 'yellow');
      rl.close();
      return;
    }
  }

  // Test video generation
  const generateVideo = await question('\nStart video generation test? (Y/n): ');
  
  if (generateVideo.toLowerCase() !== 'n') {
    const taskId = await testVideoGeneration();
    
    if (taskId) {
      const pollStatus = await question('\nPoll generation status? (Y/n): ');
      
      if (pollStatus.toLowerCase() !== 'n') {
        await testStatusPolling(taskId);
      }
    }
  }

  // Test video listing
  await testVideoListing();

  log('\n🎉 Test suite completed!', 'green');
  rl.close();
}

/**
 * Automated test runner
 */
async function runAutomatedTest() {
  log('🧪 AI ASMR Video Generation API Automated Test', 'cyan');
  log('===============================================\n');

  const results = {
    healthCheck: false,
    authentication: false,
    creditBalance: false,
    videoGeneration: false,
    statusPolling: false,
    videoListing: false
  };

  // Run all tests
  results.healthCheck = await testHealthCheck();
  results.authentication = await testUserRegistration();
  
  if (results.authentication) {
    results.creditBalance = await testCreditBalance();
    results.videoListing = await testVideoListing();
    
    // Only test video generation if we have credits
    if (results.creditBalance) {
      const taskId = await testVideoGeneration();
      if (taskId) {
        results.videoGeneration = true;
        results.statusPolling = await testStatusPolling(taskId, 10); // Shorter timeout for automated test
      }
    }
  }

  // Summary
  log('\n📊 Test Results Summary', 'cyan');
  log('=======================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${test.padEnd(20)}: ${status}`, color);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const passRate = Math.round((passedTests / totalTests) * 100);

  log(`\nPassed: ${passedTests}/${totalTests} (${passRate}%)`, passRate >= 80 ? 'green' : 'yellow');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--auto')) {
    await runAutomatedTest();
  } else {
    await runInteractiveTest();
  }
  
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n💥 Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  main();
}

module.exports = {
  testHealthCheck,
  testUserRegistration,
  testVideoGeneration,
  testStatusPolling
};