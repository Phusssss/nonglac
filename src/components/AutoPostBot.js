import React, { useState } from 'react';

const AutoPostBot = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [posts, setPosts] = useState([]);

  const startBot = () => {
    setIsRunning(true);
    // Bot logic here
  };

  const stopBot = () => {
    setIsRunning(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Auto Post Bot</h3>
      <div className="flex gap-4 mb-4">
        <button
          onClick={startBot}
          disabled={isRunning}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isRunning ? 'Đang chạy...' : 'Bắt đầu'}
        </button>
        <button
          onClick={stopBot}
          disabled={!isRunning}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Dừng
        </button>
      </div>
      <div className="text-sm text-gray-600">
        Trạng thái: {isRunning ? 'Đang hoạt động' : 'Đã dừng'}
      </div>
    </div>
  );
};

export default AutoPostBot;