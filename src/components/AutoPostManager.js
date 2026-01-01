import React, { useState } from 'react';

const AutoPostManager = () => {
  const [scheduledPosts, setScheduledPosts] = useState([]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Quản lý bài đăng tự động</h3>
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Số bài đã lên lịch: {scheduledPosts.length}
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Thêm bài mới
        </button>
      </div>
    </div>
  );
};

export default AutoPostManager;