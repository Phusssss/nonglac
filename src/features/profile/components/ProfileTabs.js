import React from 'react';
import { PROFILE_CONSTANTS } from '../constants';

const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: PROFILE_CONSTANTS.TABS.POSTS, label: 'Bài viết gần đây' },
    { id: PROFILE_CONSTANTS.TABS.ARTICLES, label: 'Bài báo' },
    { id: PROFILE_CONSTANTS.TABS.QA, label: 'Hỏi đáp' }
  ];

  return (
    <div className="border-b border-gray-200 px-6">
      <nav className="-mb-px flex space-x-6">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id 
                ? 'border-[#4CAF50] text-[#4CAF50]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;