'use client';

import { useEffect, useState } from 'react';
import { config, getCallbackUrl, isDevelopment, isLocalhost } from '@/lib/environment';

export default function DebugAuthPage() {
  const [envInfo, setEnvInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      nodeEnv: process.env.NODE_ENV,
      isDevelopment,
      isLocalhost: isLocalhost(),
      windowLocation: typeof window !== 'undefined' ? {
        origin: window.location.origin,
        hostname: window.location.hostname,
        href: window.location.href,
      } : null,
      config,
      callbackUrl: getCallbackUrl('/auth/callback'),
      envVars: {
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_PRODUCTION_URL: process.env.NEXT_PUBLIC_PRODUCTION_URL,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Not set',
      }
    };
    setEnvInfo(info);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Auth Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Environment Detection</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>NODE_ENV:</strong> {envInfo.nodeEnv}
            </div>
            <div>
              <strong>isDevelopment:</strong> {envInfo.isDevelopment ? '✓ True' : '✗ False'}
            </div>
            <div>
              <strong>isLocalhost:</strong> {envInfo.isLocalhost ? '✓ True' : '✗ False'}
            </div>
          </div>
        </div>

        {envInfo.windowLocation && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Browser Location</h2>
            <div className="space-y-2">
              <div><strong>Origin:</strong> {envInfo.windowLocation.origin}</div>
              <div><strong>Hostname:</strong> {envInfo.windowLocation.hostname}</div>
              <div><strong>Full URL:</strong> {envInfo.windowLocation.href}</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Configuration</h2>
          <div className="space-y-2">
            <div><strong>Base URL:</strong> {envInfo.config?.baseUrl}</div>
            <div><strong>Site URL:</strong> {envInfo.config?.siteUrl}</div>
            <div><strong>Callback URL:</strong> {envInfo.callbackUrl}</div>
            <div><strong>Google Callback URL:</strong> {envInfo.config?.googleCallbackUrl}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Environment Variables</h2>
          <div className="space-y-2">
            {Object.entries(envInfo.envVars || {}).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {String(value)}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Supabase Configuration Required</h2>
          <div className="space-y-3 text-blue-700">
            <p><strong>1. Supabase Dashboard Settings:</strong></p>
            <div className="bg-blue-100 p-3 rounded">
              <p><strong>Site URL</strong> (Authentication → URL Configuration):</p>
              <code className="block mt-1">http://localhost:3000</code>
            </div>
            
            <div className="bg-blue-100 p-3 rounded">
              <p><strong>Additional Redirect URLs</strong> (Authentication → URL Configuration):</p>
              <div className="mt-1">
                <code className="block">http://localhost:3000</code>
                <code className="block">http://localhost:3000/auth/callback</code>
                <code className="block">https://www.aiasmr.vip</code>
                <code className="block">https://www.aiasmr.vip/auth/callback</code>
              </div>
            </div>

            <div className="bg-blue-100 p-3 rounded">
              <p><strong>Supabase Google OAuth Callback URL</strong>:</p>
              <code className="block mt-1">https://xwthsruuafryyqspqyss.supabase.co/auth/v1/callback</code>
              <p className="text-sm mt-1">（这个URL需要添加到Google Cloud Console的重定向URI中）</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Google Cloud Console Configuration</h2>
          <div className="space-y-3 text-yellow-700">
            <p><strong>Authorized JavaScript origins:</strong></p>
            <div className="bg-yellow-100 p-3 rounded">
              <code className="block">http://localhost:3000</code>
              <code className="block">https://xwthsruuafryyqspqyss.supabase.co</code>
              <code className="block">https://www.aiasmr.vip</code>
            </div>
            
            <p><strong>Authorized redirect URIs:</strong></p>
            <div className="bg-yellow-100 p-3 rounded">
              <code className="block">http://localhost:3000/auth/callback</code>
              <code className="block">https://xwthsruuafryyqspqyss.supabase.co/auth/v1/callback</code>
              <code className="block">https://www.aiasmr.vip/auth/callback</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}