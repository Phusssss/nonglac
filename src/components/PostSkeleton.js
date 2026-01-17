import React from 'react';
import { Card, Skeleton } from 'antd';

const PostSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="mb-4">
          <div className="flex items-center mb-4">
            <Skeleton.Avatar size={40} />
            <div className="ml-4 flex-1">
              <Skeleton.Input style={{ width: '30%', height: 16 }} active />
              <Skeleton.Input style={{ width: '20%', height: 14, marginTop: 8 }} active />
            </div>
          </div>
          
          <Skeleton paragraph={{ rows: 3, width: ['90%', '70%', '50%'] }} active />
          
          <Skeleton.Image style={{ width: '100%', height: 200, marginTop: 16 }} />
          
          <div className="flex justify-between mt-4">
            <Skeleton.Input style={{ width: '15%', height: 16 }} active />
            <Skeleton.Input style={{ width: '15%', height: 16 }} active />
            <Skeleton.Input style={{ width: '15%', height: 16 }} active />
          </div>
        </Card>
      ))}
    </>
  );
};

export default PostSkeleton;