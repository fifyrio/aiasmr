'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestAuthPage() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(`Google登录错误: ${error.message}`);
        console.error('Google login error:', error);
      }
    } catch (err) {
      setError(`登录失败: ${err instanceof Error ? err.message : '未知错误'}`);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Google OAuth 测试页面</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">当前用户状态</h2>
          
          {user ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-800 font-medium">✅ 已登录</p>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>用户ID:</strong> {user.id}</p>
                  <p><strong>邮箱:</strong> {user.email}</p>
                  <p><strong>登录时间:</strong> {new Date(user.created_at).toLocaleString()}</p>
                  {user.user_metadata && (
                    <div className="mt-2">
                      <p><strong>姓名:</strong> {user.user_metadata.full_name}</p>
                      <p><strong>头像:</strong> {user.user_metadata.avatar_url}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? '退出中...' : '退出登录'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <p className="text-gray-800">❌ 未登录</p>
              </div>
              
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? '登录中...' : '使用Google登录'}
              </button>
            </div>
          )}
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-800 font-medium">错误信息:</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">调试信息</h2>
          <div className="space-y-2 text-sm">
            <p><strong>当前URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>Site URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL}</p>
          </div>
          
          <div className="mt-4">
            <a
              href="/debug-auth"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              查看完整调试信息 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}