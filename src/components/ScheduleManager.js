import React, { useState } from 'react';

const ScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Quản lý lịch trình</h3>
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Lịch trình đang hoạt động: {schedules.length}
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          Tạo lịch mới
        </button>
      </div>
    </div>
  );
};

export default ScheduleManager;