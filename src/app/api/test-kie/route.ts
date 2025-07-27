import { NextRequest, NextResponse } from 'next/server';
import { createKieVeo3Client } from '@/lib/kie-veo3-client';

export async function GET(request: NextRequest) {
  try {
    console.log('=== KIE API Connection Test Started ===');
    
    // Check environment variables
    const apiKey = process.env.KIE_API_KEY;
    const baseUrl = process.env.KIE_BASE_URL;
    
    console.log('Environment Check:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      baseUrl,
      nodeEnv: process.env.NODE_ENV
    });
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'KIE_API_KEY not configured'
      }, { status: 500 });
    }
    
    // Create client and test connection
    const kieClient = createKieVeo3Client();
    
    // Test with a simple status check or health endpoint
    try {
      console.log('Attempting to connect to KIE API...');
      
      // Instead of health endpoint, let's try to get status of a non-existent task
      // This should return a 404 or similar, but will test connectivity
      const testResponse = await fetch(`${baseUrl || 'https://api.kie.ai/api/v1'}/runway/task/test-connection`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('KIE API Test Response:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        ok: testResponse.ok
      });
      
      return NextResponse.json({
        success: true,
        message: 'KIE API connection successful',
        details: {
          status: testResponse.status,
          statusText: testResponse.statusText,
          apiUrl: baseUrl || 'https://api.kie.ai/api/v1',
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (fetchError) {
      console.error('Direct fetch test failed:', fetchError);
      
      // Fallback: try with axios client
      try {
        await kieClient.testConnection();
        return NextResponse.json({
          success: true,
          message: 'KIE API connection successful (via axios)',
          timestamp: new Date().toISOString()
        });
      } catch (axiosError) {
        console.error('Axios test also failed:', axiosError);
        throw axiosError;
      }
    }
    
  } catch (error) {
    console.error('=== KIE API Connection Test Failed ===');
    console.error('Test error details:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
      details: {
        apiUrl: process.env.KIE_BASE_URL || 'https://api.kie.ai/api/v1',
        hasApiKey: !!process.env.KIE_API_KEY,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}