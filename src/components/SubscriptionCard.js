import React from 'react';
import { SUBSCRIPTION_TIERS } from '../services/subscriptionService';

const SubscriptionCard = ({ tier, isActive = false, onSelect }) => {
  const isLocked = tier.status === 'LOCKED';
  
  return (
    <div className={`relative bg-white rounded-xl shadow-lg border-2 p-6 ${
      isActive ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
    } ${isLocked ? 'opacity-75' : ''}`}>
      
      {/* Badge */}
      {isActive && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            ĐANG SỬ DỤNG
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{tier.icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{tier.name}</h3>
        <p className="text-sm text-gray-600">{tier.subtitle}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        {tier.price === 0 ? (
          <div>
            <span className="text-3xl font-bold text-green-600">MIỄN PHÍ</span>
            <p className="text-sm text-gray-500">{tier.duration}</p>
            <p className="text-xs text-blue-600 font-medium">Ưu đãi Yersin Talent</p>
          </div>
        ) : (
          <div>
            <span className="text-3xl font-bold text-gray-800">
              {tier.price.toLocaleString('vi-VN')}đ
            </span>
            <p className="text-sm text-gray-500">/{tier.duration}</p>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="space-y-3 mb-6">
        {tier.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelect?.(tier)}
        disabled={isLocked || isActive}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isActive 
            ? 'bg-green-100 text-green-700 cursor-default'
            : isLocked
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isActive 
          ? 'Đang sử dụng'
          : isLocked 
          ? 'Sắp ra mắt'
          : tier.price === 0 
          ? 'Miễn phí'
          : 'Nâng cấp ngay'
        }
      </button>
    </div>
  );
};

const SubscriptionPlans = ({ userSubscription, onUpgrade }) => {
  const tiers = Object.values(SUBSCRIPTION_TIERS);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Chọn gói dịch vụ phù hợp
        </h2>
        <p className="text-gray-600">
          Nâng cao trải nghiệm với AI Lạc Lạc và các tính năng độc quyền
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <SubscriptionCard
            key={tier.id}
            tier={tier}
            isActive={userSubscription?.tierId === tier.id}
            onSelect={onUpgrade}
          />
        ))}
      </div>

      {/* Note */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>💡 Gói TẬP SỰ miễn phí 1 năm cho sinh viên Yersin</p>
        <p>🔒 Gói NHÀ NÔNG và CHUYÊN GIA sắp ra mắt</p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;