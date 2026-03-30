import React, { useState, useEffect } from 'react';
import { Card, Button, Spin } from 'antd';
import { FireOutlined, TrophyOutlined } from '@ant-design/icons';
import { TrendingUp, TrendingDown, Minus, LineChart, Trophy } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import WeatherWidget from '../../../components/WeatherWidget';

const parsePriceRowsFromHtml = (tableHtml, limit = 3) => {
  if (typeof window === 'undefined' || !tableHtml) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(tableHtml, 'text/html');
  const table = doc.querySelector('table');
  if (!table) return [];

  const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
  const rows = bodyRows.length ? bodyRows : Array.from(table.querySelectorAll('tr'));

  return rows
    .map((row) => ({
      row,
      cells: Array.from(row.querySelectorAll('th,td')).map((cell) => cell.textContent?.trim() || ''),
    }))
    .filter(({ row, cells }) => {
      if (!cells.length) return false;
      if (row.classList.contains('group-title')) return false;
      const hasOnlyHeader = row.querySelectorAll('th').length === cells.length;
      return !hasOnlyHeader && cells.some((value) => value);
    })
    .slice(0, limit);
};

const inferTrend = (changeText = '') => {
  const normalized = String(changeText).toLowerCase();
  if (!normalized) return 'same';

  const ascii = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (ascii.includes('-') || ascii.includes('giam')) {
    return 'down';
  }
  if (ascii.includes('+') || ascii.includes('tang')) {
    return 'up';
  }
  return 'same';
};

const RightSidebar = ({ 
  trendingTopics = [], 
  topContributors = [], 
  selectedCategory,
  onCategoryChange 
}) => {
  const [priceData, setPriceData] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoadingPrices(true);
        const latestRef = doc(db, 'full_prices', 'current');
        const latestSnap = await getDoc(latestRef);
        
        if (latestSnap.exists()) {
          const payload = latestSnap.data();
          const sections = Array.isArray(payload?.priceSections) ? payload.priceSections : [];

          let formatted = [];
          const summarySection = sections.find((section) => (
            String(section?.tableClass || '').includes('bang-gia-nong-san')
          )) || sections[0];

          if (summarySection?.tableHtml) {
            const parsedRows = parsePriceRowsFromHtml(summarySection.tableHtml, 3);
            formatted = parsedRows.map(({ cells }) => {
              const name = cells[0] || 'N/A';
              const location = cells[1] || 'N/A';
              const price = cells[2] || cells[1] || 'N/A';
              const change = cells[3] || '';

              return {
                name,
                price,
                location,
                change: change || '0%',
                trend: inferTrend(change)
              };
            });
          }

          if (formatted.length === 0 && payload?.prices) {
            const changes = payload?.changes || {};
            formatted = Object.entries(payload.prices)
              .slice(0, 3)
              .map(([name, price]) => {
                const change = changes?.[name] || '';
                return {
                  name,
                  price: price || 'N/A',
                  location: 'Tây Nguyên',
                  change: change || '0%',
                  trend: inferTrend(change)
                };
              });
          }

          if (formatted.length > 0) {
            setPriceData(formatted);
          }
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
  }, []);

  const displayPrices = priceData;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-green-600" />;
      case 'down': return <TrendingDown size={14} className="text-red-600" />;
      default: return <Minus size={14} className="text-gray-600" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'bg-green-100 text-green-700';
      case 'down': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Weather Widget */}
      <WeatherWidget />

      {/* Live Prices */}
      <Card className="shadow-sm border border-slate-100 overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-50/80 to-amber-50/50 rounded-t-xl">
          <h3 className="font-bold text-[15px] text-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-100/80 flex items-center justify-center text-orange-600">
              <LineChart size={16} strokeWidth={2.5} />
            </div>
            Giá nông sản 24h
          </h3>
          <span className="flex items-center gap-1.5 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 
            Live
          </span>
        </div>
        
        <div className="divide-y divide-slate-100 bg-white">
          {loadingPrices ? (
            <div className="flex justify-center py-6">
              <Spin size="small" />
            </div>
          ) : displayPrices.length > 0 ? (
            displayPrices.map((item, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-800 text-[14px] leading-tight group-hover:text-emerald-600 transition-colors line-clamp-1">{item.name}</span>
                  <span className="font-bold text-orange-600 text-[14px] flex-shrink-0 ml-2">{item.price}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md max-w-[120px] truncate">{item.location}</span>
                  <span className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 flex-shrink-0 ${getTrendColor(item.trend)}`}>
                    {getTrendIcon(item.trend)}
                    {item.change}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <span className="text-slate-400 text-sm">Chưa có dữ liệu giá nông sản</span>
            </div>
          )}
        </div>
        
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center hover:bg-slate-100 transition-colors cursor-pointer rounded-b-xl">
          <span className="text-[11px] font-semibold text-slate-500">
            Dữ liệu được cập nhật tự động
          </span>
        </div>
      </Card>

      {/* Top Contributors */}
      <Card className="shadow-sm border border-slate-100 overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-amber-50/80 to-yellow-50/50">
          <h3 className="font-bold text-[15px] text-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-600">
              <Trophy size={16} strokeWidth={2.5} />
            </div>
            Chuyên gia tuần này
          </h3>
        </div>
        
        <div className="p-4 space-y-3 bg-white">
          {topContributors.length > 0 ? (
            topContributors.slice(0, 3).map((contributor, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm shrink-0">
                  {contributor.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-slate-800 truncate">
                    {contributor.name || 'Người dùng'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {contributor.posts} bài viết
                  </div>
                </div>
                <div className="text-right shrink-0 min-w-[24px]">
                  <div className="text-[12px] font-bold text-amber-500">
                    #{idx + 1}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <span className="text-gray-500 text-sm italic">Chưa có dữ liệu</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RightSidebar;
