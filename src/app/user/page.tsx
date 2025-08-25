'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { useSubscription } from '@/hooks/useSubscription';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface Order {
  id: string;
  product_name: string;
  price: number;
  credits: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  amount: number;
  description: string;
  created_at: string;
  isCredit: boolean;
  videoId?: string;
  subscriptionId?: string;
}

export default function UserAccountPage() {
  const { user, loading } = useAuth();
  const { credits, loading: creditsLoading, refreshCredits: refetchCredits } = useCredits();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'credits' | 'orders'>('credits');
  const [orders, setOrders] = useState<Order[]>([]);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [creditHistoryLoading, setCreditHistoryLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/user/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', response.statusText);
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  // Fetch orders
  useEffect(() => {
    if (user && activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab, fetchOrders]);

  // Fetch credit history
  useEffect(() => {
    if (user && activeTab === 'credits') {
      fetchCreditHistory();
    }
  }, [user, activeTab]);

  // Debug: Log subscription data to verify it's correct
  useEffect(() => {
    if (subscription && !subscriptionLoading) {
      console.log('User subscription data:', {
        productName: subscription.productName,
        status: subscription.status,
        planType: subscription.planType,
        currentPeriodEnd: subscription.currentPeriodEnd,
        userId: user?.id
      });
    }
  }, [subscription, subscriptionLoading, user?.id]);

  const fetchCreditHistory = async () => {
    if (!user) return;
    
    setCreditHistoryLoading(true);
    try {
      const response = await fetch('/api/user/credit-history?limit=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCreditHistory(data.transactions || []);
      } else {
        console.error('Failed to fetch credit history:', response.statusText);
        setCreditHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch credit history:', error);
      setCreditHistory([]);
    } finally {
      setCreditHistoryLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (price: number) => {
    // 检查价格是否以分为单位存储
    // 如果价格是整数且大于等于100，很可能是以分为单位（如1990 = $19.90）
    // 如果价格包含小数点，很可能已经是美元格式（如19.90）
    
    if (Number.isInteger(price) && price >= 100) {
      // 价格以分为单位存储，转换为美元
      return `$${(price / 100).toFixed(2)}`;
    } else {
      // 价格已经是美元格式，直接格式化
      return `$${price.toFixed(2)}`;
    }
  };

  const formatPlanType = (planType: string) => {
    switch (planType) {
      case 'free':
        return 'FREE';
      case 'trial':
        return 'TRIAL';
      case 'basic':
        return 'BASIC';
      case 'pro':
        return 'PRO';
      default:
        return planType.toUpperCase();
    }
  };


  const getSubscriptionStatus = (subscription: any) => {
    if (subscription.status === 'none' || subscription.planType === 'free') {
      return 'N/A';
    }
    return subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const totalCredits = credits?.credits || 0;
  const usedCredits = 0; // TODO: Calculate from actual usage
  const usedRatio = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;

  return (
    <main className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="pt-20 pb-12 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
            <p className="text-gray-400">Manage your account, credits, and subscription</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl mb-8 p-1 flex space-x-1 border border-gray-700/50">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'info'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              User Info
            </button>
            <button
              onClick={() => setActiveTab('credits')}
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'credits'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Credits
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'orders'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Orders ({ordersLoading ? '...' : orders.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  User Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Name</label>
                    <div className="text-lg text-white font-medium">{user.user_metadata?.full_name || 'Wu Will'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Email</label>
                    <div className="text-lg text-white font-medium">{user.email}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Member Since</label>
                    <div className="text-lg text-white font-medium">{formatDate(user.created_at)}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Current Plan</label>
                    <div className="text-lg text-white font-medium">
                      {subscriptionLoading ? (
                        <div className="animate-pulse bg-gray-600 h-6 w-32 rounded"></div>
                      ) : (
                        subscription.productName
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Total Available Credits</label>
                    <div className="text-3xl font-bold text-orange-400">
                      {creditsLoading ? '...' : totalCredits}
                    </div>
                    <div className="text-sm text-gray-500">Active and valid credits only</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700/50 pt-8">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Subscription Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Plan Type</label>
                    <div className="text-lg font-medium text-white">
                      {subscriptionLoading ? (
                        <div className="animate-pulse bg-gray-600 h-6 w-16 rounded"></div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          subscription.planType === 'free' ? 'bg-gray-600 text-gray-200' :
                          subscription.planType === 'trial' ? 'bg-blue-600 text-blue-100' :
                          subscription.planType === 'basic' ? 'bg-green-600 text-green-100' :
                          subscription.planType === 'pro' ? 'bg-purple-600 text-purple-100' :
                          'bg-gray-600 text-gray-200'
                        }`}>
                          {formatPlanType(subscription.planType)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Subscription Status</label>
                    <div className="text-lg text-gray-300">
                      {subscriptionLoading ? (
                        <div className="animate-pulse bg-gray-600 h-6 w-16 rounded"></div>
                      ) : (
                        <span className={`${
                          subscription.status === 'active' ? 'text-green-400' :
                          subscription.status === 'cancelled' ? 'text-red-400' :
                          subscription.status === 'expired' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          {getSubscriptionStatus(subscription)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'credits' && (
            <div className="space-y-8">
              {/* Credit Statistics */}
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Credit Statistics
                  </h2>
                  <p className="text-gray-400">Overview of your credit status</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
                    <div className="text-sm text-gray-400 mb-2">Total Credits</div>
                    <div className="text-4xl font-bold text-blue-400 mb-1">
                      {creditsLoading ? '...' : totalCredits}
                    </div>
                  </div>
                  <div className="text-center bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
                    <div className="text-sm text-gray-400 mb-2">Active Credits</div>
                    <div className="text-4xl font-bold text-green-400 mb-1">
                      {creditsLoading ? '...' : totalCredits}
                    </div>
                  </div>
                  <div className="text-center bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
                    <div className="text-sm text-gray-400 mb-2">Used Ratio</div>
                    <div className="text-4xl font-bold text-purple-400 mb-1">{usedRatio.toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              {/* Credit History */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Credit History
                  </h3>
                  <p className="text-gray-400">Detailed history of all your credit transactions</p>
                </div>

                {creditHistoryLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                  </div>
                ) : creditHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-medium text-white mb-2">No credit history found.</h3>
                    <p className="text-gray-400">Your credit transaction history will appear here once you make a purchase.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creditHistory.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-6 bg-gray-700/50 rounded-lg border border-gray-600/30 hover:bg-gray-700/70 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            transaction.type === 'purchase' || transaction.type === 'bonus' ? 'bg-green-500/20 text-green-400' :
                            transaction.type === 'usage' ? 'bg-red-500/20 text-red-400' :
                            transaction.type === 'refund' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {transaction.type === 'purchase' || transaction.type === 'bonus' ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            ) : transaction.type === 'usage' ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            ) : transaction.type === 'refund' ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : '?'}
                          </div>
                          <div>
                            <div className="font-medium text-white">{transaction.description}</div>
                            <div className="text-sm text-gray-400">
                              {formatDate(transaction.created_at)}
                              {transaction.type === 'usage' && transaction.videoId && (
                                <span className="ml-2 text-purple-400">• Video Generation</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold text-lg ${
                          transaction.isCredit ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.isCredit ? '+' : '-'}
                          {transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Payment History
                </h2>
                <p className="text-gray-400">Your payment history will appear here once you make a purchase.</p>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-medium text-white mb-2">No payment history found.</h3>
                  <p className="text-gray-400">Your payment history will appear here once you make a purchase.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-gray-700/50 border border-gray-600/30 rounded-lg p-6 hover:bg-gray-700/70 transition-colors">
                      <div className="mb-4">
                        <div className="font-medium text-white text-lg">{order.product_name}</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
                        <div>
                          <span className="text-gray-400 font-medium">Price:</span> 
                          <span className="text-white font-semibold ml-2">{formatPrice(order.price)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-medium">Credits:</span> 
                          <span className="text-white font-semibold ml-2">{order.credits}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-medium">Date:</span> 
                          <span className="text-white font-semibold ml-2">{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}