'use client'

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useCredits } from '@/contexts/CreditsContext';

const UserSubscriptionStatus = () => {
  const { subscription, loading: subLoading } = useSubscription();
  const { credits, loading: creditsLoading } = useCredits();

  if (subLoading || creditsLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{subscription.productName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor(subscription.planType)}`}>
                {subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)}
              </span>
              {subscription.status !== 'none' && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">Available Credits</span>
          <span className="text-lg font-bold text-blue-600">{credits.credits.toLocaleString()}</span>
        </div>

        {/* Subscription Period */}
        {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
          <div className="text-sm text-gray-600 border-t border-gray-100 pt-2">
            <div className="flex justify-between">
              <span>Period Start:</span>
              <span>{new Date(subscription.currentPeriodStart).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Period End:</span>
              <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Cancellation Info */}
        {subscription.cancelledAt && (
          <div className="text-sm text-yellow-600 border-t border-gray-100 pt-2">
            <div className="flex justify-between">
              <span>Cancelled On:</span>
              <span>{new Date(subscription.cancelledAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Usage Stats */}
        {credits.totalVideosCreated > 0 && (
          <div className="text-sm text-gray-600 border-t border-gray-100 pt-2">
            <div className="flex justify-between">
              <span>Videos Created:</span>
              <span>{credits.totalVideosCreated}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Credits Spent:</span>
              <span>{credits.totalCreditsSpent.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubscriptionStatus;