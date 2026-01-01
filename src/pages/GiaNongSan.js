import React from 'react';
import SEO from '../components/SEO';
import CoffeePrices from '../components/CoffeePrices';

const GiaNongSan = () => {
  return (
    <>
      <SEO 
        title="Giá Nông Sản Hôm Nay - Cập Nhật Giá Cà Phê, Lúa Gạo Mới Nhất"
        description="Cập nhật giá nông sản hôm nay: giá cà phê, lúa gạo, tiêu, cao su và các nông sản khác. Theo dõi biến động giá thị trường nông nghiệp Việt Nam."
        keywords="giá nông sản hôm nay, giá cà phê, giá lúa gạo, giá tiêu, giá cao su, thị trường nông sản việt nam, giá nông sản mới nhất"
        url="/gia-nong-san"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-[#795548] mb-6">Giá Nông Sản Hôm Nay</h1>
          <CoffeePrices />
        </div>
      </div>
    </>
  );
};

export default GiaNongSan;