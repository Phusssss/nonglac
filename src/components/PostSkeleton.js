import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';

const PostSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box ml={2} flex={1}>
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="20%" />
              </Box>
            </Box>
            
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
            
            <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} />
            
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Skeleton variant="text" width="15%" />
              <Skeleton variant="text" width="15%" />
              <Skeleton variant="text" width="15%" />
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default PostSkeleton;