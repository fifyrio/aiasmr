#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

async function testKieAPI() {
  try {
    console.log('Testing new KIE API integration...')
    
    // Test API endpoint
    const testPayload = {
      prompt: "ASMR video: A satisfying soap cutting scene with gentle bubbles, featuring soap cutting and squishing sounds. High quality, smooth camera movement, relaxing atmosphere, 4K resolution, soft lighting, calming ambiance.",
      triggers: ["soap"],
      aspectRatio: "16:9",
      duration: 5,
      quality: "720p",
      waterMark: "Test Video"
    }
    
    console.log('Test payload:', JSON.stringify(testPayload, null, 2))
    
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseData = await response.json()
    console.log('Response data:', JSON.stringify(responseData, null, 2))
    
    if (response.ok && responseData.success && responseData.taskId) {
      console.log('✅ API test successful!')
      console.log('Task ID:', responseData.taskId)
      
      // Test the new parameter validations
      console.log('\n--- Testing parameter validations ---')
      
      // Test 8s + 1080p combination (should fail)
      const invalidPayload = {
        ...testPayload,
        duration: 8,
        quality: "1080p"
      }
      
      console.log('Testing invalid combination (8s + 1080p)...')
      const invalidResponse = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidPayload)
      })
      
      const invalidData = await invalidResponse.json()
      console.log('Invalid response:', invalidData)
      
      if (!invalidResponse.ok && invalidData.error && invalidData.error.includes('8-second videos cannot be generated in 1080p')) {
        console.log('✅ Parameter validation working correctly!')
      } else {
        console.log('❌ Parameter validation failed')
      }
      
    } else {
      console.log('❌ API test failed')
      console.error('Error:', responseData.error || 'Unknown error')
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('📝 Make sure your development server is running: npm run dev')
    }
  }
}

// Check required environment variables
function checkEnvironment() {
  const requiredVars = ['KIE_API_KEY', 'KIE_BASE_URL']
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '))
    console.log('📝 Make sure your .env.local file is configured properly')
    return false
  }
  
  console.log('✅ Environment variables configured')
  console.log('KIE_BASE_URL:', process.env.KIE_BASE_URL)
  console.log('KIE_API_KEY:', process.env.KIE_API_KEY ? `${process.env.KIE_API_KEY.substring(0, 8)}...` : 'Not set')
  
  return true
}

async function main() {
  console.log('🧪 KIE API Integration Test')
  console.log('==========================\n')
  
  if (!checkEnvironment()) {
    process.exit(1)
  }
  
  console.log('')
  await testKieAPI()
}

main().catch(console.error)