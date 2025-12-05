import React, { useState } from 'react';

const FigmaToReact = () => {
  const [figmaCSS, setFigmaCSS] = useState('');
  const [reactCode, setReactCode] = useState('');

  const convertToReact = () => {
    const generateComponent = () => {
      let jsx = `import React from 'react';\n\n`;
      jsx += `const HotelBooking = () => {\n`;
      jsx += `  return (\n`;
      jsx += `    <div className="relative w-full h-screen bg-gray-50">\n`;
      
      // Sidebar
      jsx += `      {/* Sidebar */}\n`;
      jsx += `      <div className="fixed left-0 top-0 w-72 h-full bg-white shadow-lg flex flex-col p-4">\n`;
      jsx += `        {/* Logo */}\n`;
      jsx += `        <div className="flex items-center gap-3 mb-6">\n`;
      jsx += `          <div className="w-16 h-16 bg-blue-600 rounded-full"></div>\n`;
      jsx += `          <h1 className="text-3xl font-bold text-blue-600">BlueHotel</h1>\n`;
      jsx += `        </div>\n\n`;
      
      jsx += `        {/* Search */}\n`;
      jsx += `        <div className="mb-6">\n`;
      jsx += `          <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">\n`;
      jsx += `            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />\n`;
      jsx += `            </svg>\n`;
      jsx += `            <input type="text" placeholder="Tìm nhanh" className="bg-transparent outline-none text-gray-500" />\n`;
      jsx += `          </div>\n`;
      jsx += `        </div>\n\n`;

      jsx += `        {/* Navigation */}\n`;
      jsx += `        <nav className="flex-1">\n`;
      jsx += `          <div className="space-y-1">\n`;
      jsx += `            <div className="bg-blue-50 text-blue-600 px-4 py-3 rounded flex items-center gap-3">\n`;
      jsx += `              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">\n`;
      jsx += `                <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z" />\n`;
      jsx += `              </svg>\n`;
      jsx += `              <span className="font-medium">Trang chủ</span>\n`;
      jsx += `            </div>\n`;
      jsx += `            <div className="px-4 py-3 rounded flex items-center gap-3 hover:bg-gray-50">\n`;
      jsx += `              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />\n`;
      jsx += `              </svg>\n`;
      jsx += `              <span>Nhân viên</span>\n`;
      jsx += `            </div>\n`;
      jsx += `            <div className="bg-blue-50 text-blue-600 px-4 py-3 rounded flex items-center gap-3">\n`;
      jsx += `              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />\n`;
      jsx += `              </svg>\n`;
      jsx += `              <span className="font-medium">Đặt phòng</span>\n`;
      jsx += `            </div>\n`;
      jsx += `          </div>\n\n`;

      jsx += `          {/* Management Section */}\n`;
      jsx += `          <div className="mt-6">\n`;
      jsx += `            <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded flex items-center gap-2 mb-2">\n`;
      jsx += `              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />\n`;
      jsx += `              </svg>\n`;
      jsx += `              <span className="font-medium text-sm">Quản lý phòng</span>\n`;
      jsx += `            </div>\n`;
      jsx += `            <div className="ml-4 space-y-1 text-sm">\n`;
      jsx += `              <div className="px-3 py-2 hover:bg-gray-50 rounded">Danh sách khách hàng</div>\n`;
      jsx += `              <div className="px-3 py-2 hover:bg-gray-50 rounded">Danh sách dịch vụ</div>\n`;
      jsx += `              <div className="px-3 py-2 hover:bg-gray-50 rounded">Thông báo chung</div>\n`;
      jsx += `              <div className="px-3 py-2 hover:bg-gray-50 rounded">Hóa đơn & danh thu</div>\n`;
      jsx += `              <div className="px-3 py-2 hover:bg-gray-50 rounded">Cài đặt thanh toán</div>\n`;
      jsx += `              <div className="px-3 py-2 hover:bg-gray-50 rounded">Cài đặt mã pin</div>\n`;
      jsx += `            </div>\n`;
      jsx += `          </div>\n`;
      jsx += `        </nav>\n\n`;

      jsx += `        {/* User Profile */}\n`;
      jsx += `        <div className="flex items-center gap-3 p-3 bg-white shadow rounded">\n`;
      jsx += `          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>\n`;
      jsx += `          <div>\n`;
      jsx += `            <div className="font-medium text-sm">Nguyễn Minh Phú</div>\n`;
      jsx += `            <div className="text-xs text-gray-500">Quản lý</div>\n`;
      jsx += `          </div>\n`;
      jsx += `        </div>\n`;
      jsx += `      </div>\n\n`;

      // Header
      jsx += `      {/* Header */}\n`;
      jsx += `      <div className="fixed top-0 left-72 right-0 h-13 bg-white shadow-sm flex items-center px-4 gap-4">\n`;
      jsx += `        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />\n`;
      jsx += `        </svg>\n`;
      jsx += `        <div className="w-16 h-7 bg-white shadow rounded-full flex items-center px-1">\n`;
      jsx += `          <div className="w-8 h-6 bg-white shadow rounded-full flex items-center justify-center">\n`;
      jsx += `            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">\n`;
      jsx += `              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />\n`;
      jsx += `            </svg>\n`;
      jsx += `          </div>\n`;
      jsx += `        </div>\n`;
      jsx += `        <div className="flex-1"></div>\n`;
      jsx += `        <div className="flex items-center gap-3">\n`;
      jsx += `          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5z" />\n`;
      jsx += `          </svg>\n`;
      jsx += `          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01" />\n`;
      jsx += `          </svg>\n`;
      jsx += `          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>\n`;
      jsx += `        </div>\n`;
      jsx += `      </div>\n\n`;

      // Main Content
      jsx += `      {/* Main Content */}\n`;
      jsx += `      <div className="ml-72 pt-16 p-6">\n`;
      jsx += `        {/* Filters */}\n`;
      jsx += `        <div className="flex gap-4 mb-6">\n`;
      jsx += `          <div className="flex-1">\n`;
      jsx += `            <label className="block text-sm font-medium mb-1">Trạng thái</label>\n`;
      jsx += `            <select className="w-full px-3 py-2 border border-gray-200 rounded-md">\n`;
      jsx += `              <option>Tất cả</option>\n`;
      jsx += `            </select>\n`;
      jsx += `          </div>\n`;
      jsx += `          <div className="flex-1">\n`;
      jsx += `            <label className="block text-sm font-medium mb-1">Loại phòng</label>\n`;
      jsx += `            <select className="w-full px-3 py-2 border border-gray-200 rounded-md">\n`;
      jsx += `              <option>Tất cả</option>\n`;
      jsx += `            </select>\n`;
      jsx += `          </div>\n`;
      jsx += `          <div className="flex-1">\n`;
      jsx += `            <label className="block text-sm font-medium mb-1">Khu vực</label>\n`;
      jsx += `            <select className="w-full px-3 py-2 border border-gray-200 rounded-md">\n`;
      jsx += `              <option>Tất cả</option>\n`;
      jsx += `            </select>\n`;
      jsx += `          </div>\n`;
      jsx += `        </div>\n\n`;

      // Stats Cards
      jsx += `        {/* Stats */}\n`;
      jsx += `        <div className="grid grid-cols-4 gap-4 mb-6">\n`;
      jsx += `          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">\n`;
      jsx += `            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">\n`;
      jsx += `              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />\n`;
      jsx += `              </svg>\n`;
      jsx += `            </div>\n`;
      jsx += `            <div>\n`;
      jsx += `              <div className="text-sm text-gray-500">Tổng số phòng</div>\n`;
      jsx += `              <div className="text-2xl font-bold">100</div>\n`;
      jsx += `            </div>\n`;
      jsx += `          </div>\n`;
      jsx += `          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">\n`;
      jsx += `            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">\n`;
      jsx += `              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857" />\n`;
      jsx += `              </svg>\n`;
      jsx += `            </div>\n`;
      jsx += `            <div>\n`;
      jsx += `              <div className="text-sm text-gray-500">Phòng đang có khách</div>\n`;
      jsx += `              <div className="text-2xl font-bold">30</div>\n`;
      jsx += `            </div>\n`;
      jsx += `          </div>\n`;
      jsx += `          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">\n`;
      jsx += `            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">\n`;
      jsx += `              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3" />\n`;
      jsx += `              </svg>\n`;
      jsx += `            </div>\n`;
      jsx += `            <div>\n`;
      jsx += `              <div className="text-sm text-gray-500">Số phòng trống</div>\n`;
      jsx += `              <div className="text-2xl font-bold">70</div>\n`;
      jsx += `            </div>\n`;
      jsx += `          </div>\n`;
      jsx += `          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">\n`;
      jsx += `            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">\n`;
      jsx += `              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />\n`;
      jsx += `              </svg>\n`;
      jsx += `            </div>\n`;
      jsx += `            <div>\n`;
      jsx += `              <div className="text-sm text-gray-500">Phòng cần dọn dẹp</div>\n`;
      jsx += `              <div className="text-2xl font-bold">4</div>\n`;
      jsx += `            </div>\n`;
      jsx += `          </div>\n`;
      jsx += `        </div>\n\n`;

      // Room Grid
      jsx += `        {/* Room Grid */}\n`;
      jsx += `        <div className="space-y-6">\n`;
      jsx += `          {[1, 2, 3, 4].map(floor => (\n`;
      jsx += `            <div key={floor} className="bg-white rounded-lg shadow-sm p-6">\n`;
      jsx += `              <div className="flex items-center justify-between">\n`;
      jsx += `                <h3 className="text-xl font-bold">Tầng {floor}</h3>\n`;
      jsx += `                <div className="grid grid-cols-5 gap-3 flex-1 ml-8">\n`;
      jsx += `                  {Array.from({length: 10}).map((_, i) => {\n`;
      jsx += `                    const roomNumber = floor * 100 + i + 1;\n`;
      jsx += `                    const isOccupied = Math.random() > 0.7;\n`;
      jsx += `                    const needsCleaning = Math.random() > 0.9;\n`;
      jsx += `                    \n`;
      jsx += `                    return (\n`;
      jsx += `                      <div key={i} className={\`p-3 rounded-lg border \${needsCleaning ? 'border-red-200' : isOccupied ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 border-gray-200'}\`}>\n`;
      jsx += `                        <div className="font-bold text-sm">{roomNumber} - TunZ</div>\n`;
      jsx += `                        <div className="text-xs opacity-75">Giá ngày - 500.000</div>\n`;
      jsx += `                        <div className="text-xs opacity-75">Phòng Double</div>\n`;
      jsx += `                        <div className="text-xs opacity-75">Tầng {floor}</div>\n`;
      jsx += `                        <div className="mt-2 flex justify-end">\n`;
      jsx += `                          {needsCleaning ? (\n`;
      jsx += `                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full flex items-center gap-1">\n`;
      jsx += `                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />\n`;
      jsx += `                              </svg>\n`;
      jsx += `                              Phòng bẩn\n`;
      jsx += `                            </span>\n`;
      jsx += `                          ) : isOccupied ? (\n`;
      jsx += `                            <span className="px-2 py-1 bg-blue-200 text-white text-xs rounded-full flex items-center gap-1">\n`;
      jsx += `                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n`;
      jsx += `                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />\n`;
      jsx += `                              </svg>\n`;
      jsx += `                              Đang ở: 16 giờ\n`;
      jsx += `                            </span>\n`;
      jsx += `                          ) : (\n`;
      jsx += `                            <span className="px-2 py-1 bg-gray-300 text-white text-xs rounded-full">\n`;
      jsx += `                              Phòng Trống\n`;
      jsx += `                            </span>\n`;
      jsx += `                          )}\n`;
      jsx += `                        </div>\n`;
      jsx += `                      </div>\n`;
      jsx += `                    );\n`;
      jsx += `                  })}\n`;
      jsx += `                </div>\n`;
      jsx += `              </div>\n`;
      jsx += `            </div>\n`;
      jsx += `          ))}\n`;
      jsx += `        </div>\n`;
      jsx += `      </div>\n\n`;

      jsx += `      {/* Footer */}\n`;
      jsx += `      <div className="fixed bottom-0 left-0 right-0 bg-gray-600 text-white text-center py-1">\n`;
      jsx += `        <div className="text-xs">Copyright © 2025 Horeca Team. All rights reserved.</div>\n`;
      jsx += `      </div>\n`;
      jsx += `    </div>\n`;
      jsx += `  );\n`;
      jsx += `};\n\n`;
      jsx += `export default HotelBooking;`;

      return jsx;
    };

    setReactCode(generateComponent());
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reactCode);
    alert('Đã copy code!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Figma CSS to React Converter</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Figma CSS Input</h2>
            <textarea
              value={figmaCSS}
              onChange={(e) => setFigmaCSS(e.target.value)}
              placeholder="Paste your Figma CSS here..."
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <button
              onClick={convertToReact}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Convert to React
            </button>
          </div>

          {/* Output */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">React Component Output</h2>
              {reactCode && (
                <button
                  onClick={copyToClipboard}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Copy Code
                </button>
              )}
            </div>
            <textarea
              value={reactCode}
              readOnly
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Hướng dẫn sử dụng:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Copy CSS code từ Figma (Right click → Copy/Paste → Copy as CSS)</li>
            <li>Paste vào ô "Figma CSS Input"</li>
            <li>Click "Convert to React"</li>
            <li>Copy code React đã được chuyển đổi</li>
            <li>Sử dụng trong project React với Tailwind CSS</li>
          </ol>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Tool này tạo ra component cơ bản cho hotel booking system. 
              Bạn có thể tùy chỉnh thêm theo nhu cầu cụ thể.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigmaToReact;