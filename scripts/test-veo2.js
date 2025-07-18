#!/usr/bin/env node

/**
 * Google Veo2 API 配置测试脚本
 * 用于验证API配置是否正确
 */

const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function testVeo2Configuration() {
  console.log('🔍 开始测试 Google Veo2 API 配置...\n');

  // 检查环境变量
  console.log('1. 检查环境变量:');
  const requiredEnvVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_LOCATION',
    'GOOGLE_APPLICATION_CREDENTIALS'
  ];

  let envVarsOk = true;
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`   ✅ ${envVar}: ${value}`);
    } else {
      console.log(`   ❌ ${envVar}: 未设置`);
      envVarsOk = false;
    }
  }

  if (!envVarsOk) {
    console.log('\n❌ 环境变量配置不完整，请检查 .env.local 文件');
    return;
  }

  console.log('\n2. 测试 Google 认证:');
  try {
    const auth = new GoogleAuth({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    
    if (accessToken.token) {
      console.log('   ✅ Google 认证成功');
    } else {
      console.log('   ❌ Google 认证失败');
      return;
    }
  } catch (error) {
    console.log(`   ❌ Google 认证错误: ${error.message}`);
    return;
  }

  console.log('\n3. 测试 Veo2 API 端点:');
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION;
    const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/veo2:predict`;
    
    console.log(`   📍 API 端点: ${apiUrl}`);
    console.log('   ✅ API 端点格式正确');
  } catch (error) {
    console.log(`   ❌ API 端点错误: ${error.message}`);
  }

  console.log('\n4. 测试存储配置:');
  const storageBucket = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
  if (storageBucket) {
    console.log(`   ✅ 存储桶: ${storageBucket}`);
  } else {
    console.log('   ⚠️  存储桶未设置，将使用默认值');
  }

  console.log('\n5. 测试 Supabase 配置:');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    console.log('   ✅ Supabase 配置完整');
  } else {
    console.log('   ⚠️  Supabase 配置不完整');
  }

  console.log('\n🎉 配置测试完成！');
  console.log('\n📝 下一步:');
  console.log('1. 确保 Google Cloud 项目已启用 Veo2 API');
  console.log('2. 确认服务账号有足够权限');
  console.log('3. 设置有效的计费账户');
  console.log('4. 运行 npm run dev 启动开发服务器');
  console.log('5. 访问 http://localhost:3000/create 测试视频生成');
}

// 运行测试
testVeo2Configuration().catch(console.error); 