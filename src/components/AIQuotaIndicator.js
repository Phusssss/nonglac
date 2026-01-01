import React, { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';
import { useAuth } from '../hooks/useAuth';

const AIQuotaIndicator = ({ actionType = 'askAI', showLabel = true }) => {
  const { user } = useAuth();
  const [quota, setQuota] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const updateQuota = async () => {
      try {
        const remaining = await subscriptionService.getRemainingQuota(user.uid);
        const sub = await subscriptionService.getUserSubscription(user.uid);
        

        
        setQuota(remaining);
        setSubscription(sub);
      } catch (error) {
        console.error('Error updating quota:', error);
      }
    };

    updateQuota();
    const interval = setInterval(updateQuota, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (!quota || !user) return null;

  const getQuotaInfo = () => {
    switch (actionType) {
      case 'askAI':
        return {
          remaining: quota.aiQuestions || 0,
          total: 20,
          label: 'câu hỏi AI',
          icon: '🤖'
        };
      case 'doctorAI':
        return {
          remaining: quota.doctorAI || 0,
          total: 10,
          label: 'bác sĩ AI',
          icon: '👨‍⚕️'
        };
      case 'agriMap':
        return {
          remaining: quota.agriMap || 0,
          total: 10,
          label: 'bản đồ nông vụ',
          icon: '🗺️'
        };
      case 'marketInsights':
        return {
          remaining: quota.marketInsights || 0,
          total: 10,
          label: 'thị trường',
          icon: '📊'
        };
      case 'createPost':
        return {
          remaining: quota.posts || 0,
          total: 10,
          label: 'bài đăng',
          icon: '📝'
        };
      default:
        return null;
    }
  };

  const info = getQuotaInfo();
  if (!info) return null;

  const isUnlimited = info.total === -1;
  const percentage = isUnlimited ? 100 : (info.remaining / info.total) * 100;
  const isLow = percentage < 20 && !isUnlimited;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
    }`}>
      <span>{info.icon}</span>
      {showLabel && <span>{info.label}:</span>}
      <span className="font-medium">
        {isUnlimited ? '∞' : info.remaining}
        {!isUnlimited && `/${info.total}`}
      </span>
    </div>
  );
};

export default AIQuotaIndicator;