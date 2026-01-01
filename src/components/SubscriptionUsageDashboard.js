import React, { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';
import { useAuth } from '../hooks/useAuth';

const SubscriptionUsageDashboard = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const updateUsage = () => {
      setSubscription(subscriptionService.getUserSubscription(user.uid));
      setRemaining(subscriptionService.getRemainingQuota(user.uid));
    };

    updateUsage();
    const interval = setInterval(updateUsage, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (!subscription || !remaining || !user) return null;

  const getUsagePercent = (used, limit) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const usage = subscription.usage;
  const limits = subscription.tier.limits;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">
          {subscription.tier.icon} {subscription.tier.name}
        </h3>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          {subscription.tier.subtitle}
        </span>
      </div>
      
      {/* AI Questions */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>AI Questions</span>
          <span>
            {usage.aiQuestions} / {limits.aiQuestionsPerDay === -1 ? '∞' : limits.aiQuestionsPerDay}
          </span>
        </div>
        {limits.aiQuestionsPerDay !== -1 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                getUsagePercent(usage.aiQuestions, limits.aiQuestionsPerDay) > 80 ? 'bg-red-500' : 
                getUsagePercent(usage.aiQuestions, limits.aiQuestionsPerDay) > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${getUsagePercent(usage.aiQuestions, limits.aiQuestionsPerDay)}%` }}
            />
          </div>
        )}
      </div>

      {/* Voice Calls */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Voice Calls</span>
          <span>
            {usage.voiceCalls} / {limits.voiceCallsPerDay === -1 ? '∞' : limits.voiceCallsPerDay}
          </span>
        </div>
        {limits.voiceCallsPerDay !== -1 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                getUsagePercent(usage.voiceCalls, limits.voiceCallsPerDay) > 80 ? 'bg-red-500' : 
                getUsagePercent(usage.voiceCalls, limits.voiceCallsPerDay) > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${getUsagePercent(usage.voiceCalls, limits.voiceCallsPerDay)}%` }}
            />
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Posts Today</span>
          <span>
            {usage.postsCreated} / {limits.postsPerDay === -1 ? '∞' : limits.postsPerDay}
          </span>
        </div>
        {limits.postsPerDay !== -1 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                getUsagePercent(usage.postsCreated, limits.postsPerDay) > 80 ? 'bg-red-500' : 
                getUsagePercent(usage.postsCreated, limits.postsPerDay) > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${getUsagePercent(usage.postsCreated, limits.postsPerDay)}%` }}
            />
          </div>
        )}
      </div>

      {/* Reset Timer */}
      <div className="text-xs text-gray-500 text-center">
        Quota reset vào 00:00 hàng ngày
      </div>

      {/* Upgrade prompt for Apprentice users */}
      {subscription.tierId === 'apprentice' && (
        <div className="mt-3 p-2 bg-blue-50 text-blue-700 text-xs rounded text-center">
          💎 Nâng cấp để có thêm quota và tính năng cao cấp
        </div>
      )}
    </div>
  );
};

export default SubscriptionUsageDashboard;