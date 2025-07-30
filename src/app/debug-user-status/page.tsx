'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { useSubscription } from '@/hooks/useSubscription';
import UserSubscriptionStatus from '@/components/UserSubscriptionStatus';

export default function DebugUserStatusPage() {
  const { user } = useAuth();
  const { credits, refreshCredits } = useCredits();
  const { subscription, refreshSubscription } = useSubscription();
  const [refreshing, setRefreshing] = useState(false);
  const [apiData, setApiData] = useState<any>(null);

  const handleRefreshStatus = useCallback(async () => {
    setRefreshing(true);
    try {
      // Call both hooks refresh
      refreshCredits();
      refreshSubscription();
      
      // Also call API refresh
      const response = await fetch('/api/user/refresh-status', {
        method: 'POST',
      });
      const data = await response.json();
      setApiData(data);
    } catch (error) {
      console.error('Error refreshing status:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshCredits, refreshSubscription]);

  useEffect(() => {
    if (user) {
      handleRefreshStatus();
    }
  }, [user, handleRefreshStatus]);

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">User Status Debug</h1>
        <p className="text-red-600">Please log in to view your status.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Status Debug</h1>
        <button
          onClick={handleRefreshStatus}
          disabled={refreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Status Component */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Subscription Status (Component)</h2>
          <UserSubscriptionStatus />
        </div>
        
        {/* Raw Hook Data */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Hook Data</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-2">Credits Hook</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(credits, null, 2)}
              </pre>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-2">Subscription Hook</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(subscription, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        
        {/* API Data */}
        {apiData && (
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">API Response</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {/* User Info */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">User Info</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">User ID:</span>
                <span className="ml-2 text-gray-600">{user.id}</span>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <span className="ml-2 text-gray-600">{user.email}</span>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(user.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Last Sign In:</span>
                <span className="ml-2 text-gray-600">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}