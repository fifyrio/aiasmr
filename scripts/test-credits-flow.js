/**
 * Test script for credits management flow
 * Run with: node scripts/test-credits-flow.js
 */

const { deductCredits, refundCredits, getUserCredits } = require('../src/lib/credits-manager');

async function testCreditsFlow() {
  try {
    console.log('🧪 Starting credits management test...');
    
    // Test user ID (replace with actual test user)
    const testUserId = 'test-user-123';
    const testTaskId = 'test-task-' + Date.now();
    
    console.log('📊 Testing with:');
    console.log(`   - User ID: ${testUserId}`);
    console.log(`   - Task ID: ${testTaskId}`);
    
    // 1. Get initial credits
    console.log('\n1️⃣ Getting initial credits...');
    const initialCredits = await getUserCredits(testUserId);
    console.log(`   Initial credits: ${initialCredits.credits}`);
    
    // 2. Deduct credits
    console.log('\n2️⃣ Deducting 20 credits...');
    const deductResult = await deductCredits(
      testUserId, 
      20, 
      'Video generation test',
      testTaskId
    );
    
    if (deductResult.success) {
      console.log(`   ✅ Deduction successful. Remaining: ${deductResult.remainingCredits}`);
    } else {
      console.log(`   ❌ Deduction failed: ${deductResult.error}`);
      return;
    }
    
    // 3. Simulate failure and refund
    console.log('\n3️⃣ Simulating failure and processing refund...');
    const refundResult = await refundCredits(
      testUserId,
      20,
      'Video generation failed - Test simulation',
      testTaskId
    );
    
    if (refundResult.success) {
      console.log(`   ✅ Refund successful. New balance: ${refundResult.newCredits}`);
    } else {
      console.log(`   ❌ Refund failed: ${refundResult.error}`);
    }
    
    // 4. Get final credits
    console.log('\n4️⃣ Getting final credits...');
    const finalCredits = await getUserCredits(testUserId);
    console.log(`   Final credits: ${finalCredits.credits}`);
    
    // 5. Verify balance
    if (initialCredits.credits === finalCredits.credits) {
      console.log('\n✅ Test completed successfully! Credits were properly deducted and refunded.');
    } else {
      console.log('\n⚠️ Test completed but credits don\'t match initial balance.');
      console.log(`   Expected: ${initialCredits.credits}, Got: ${finalCredits.credits}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testCreditsFlow();
}

module.exports = { testCreditsFlow };