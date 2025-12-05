import React from 'react';

const TestSvgComponent = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-[#4CAF50] mb-4">Test SVG Component</h1>
        
        {/* Simple SVG Icon */}
        <svg 
          width="200" 
          height="200" 
          viewBox="0 0 200 200" 
          className="mx-auto mb-4"
        >
          <circle 
            cx="100" 
            cy="100" 
            r="80" 
            fill="#4CAF50" 
            opacity="0.8"
          />
          <path 
            d="M60 100 L90 130 L140 70" 
            stroke="white" 
            strokeWidth="8" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        
        <p className="text-gray-600 text-center">
          SVG Component đang hoạt động!
        </p>
      </div>
    </div>
  );
};

export default TestSvgComponent;