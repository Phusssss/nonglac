import React from 'react';
import PostGenerator from '../components/PostGenerator';

const PostGeneratorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#795548] mb-2">
          Post Generator Tool
        </h1>
        <p className="text-gray-600 mb-6">
          Tool tạo bài viết mẫu với nội dung chất lượng cao cho các danh mục nông nghiệp.
        </p>
        
        <PostGenerator />
        
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#795548] mb-4">Hướng dẫn sử dụng:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Chọn số lượng bài viết muốn tạo (1-20)</li>
            <li>Chọn danh mục cụ thể hoặc để "Ngẫu nhiên"</li>
            <li>Bấm "Tạo bài viết" và chờ hoàn thành</li>
            <li>Các bài viết sẽ xuất hiện trên trang chủ</li>
          </ol>
          
          <h2 className="text-xl font-bold text-[#795548] mt-6 mb-4">Nội dung bao gồm:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Trồng trọt:</strong> Kỹ thuật trồng lúa, rau sạch, ghép cây ăn quả</li>
            <li><strong>Chăn nuôi:</strong> Nuôi gà thả vườn, heo sạch VietGAP</li>
            <li><strong>Thủy sản:</strong> Nuôi cá tra, tôm thẻ công nghệ cao</li>
            <li><strong>Kỹ thuật:</strong> IoT, công nghệ hiện đại</li>
            <li><strong>Thị trường:</strong> Phân tích giá cả, xu hướng</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PostGeneratorPage;