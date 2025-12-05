import React, { useState, useRef } from 'react';
import { Box, Button, Typography, LinearProgress, Alert, Card, CardContent, Chip, Divider, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { CloudUpload, Assessment, Delete, Repeat } from '@mui/icons-material';
import { githubStorage } from '../services/githubStorage';

const GitHubUploadTester = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [repeatCount, setRepeatCount] = useState(1);
  const [enableRepeat, setEnableRepeat] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const fileInputRef = useRef();

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setResults([]);
    setCurrentRound(0);
    
    const rounds = enableRepeat ? repeatCount : 1;
    const totalOperations = files.length * rounds;
    let completedOperations = 0;

    for (let round = 1; round <= rounds; round++) {
      setCurrentRound(round);
      
      for (const file of files) {
        try {
          const startTime = Date.now();
          setProgress((completedOperations / totalOperations) * 100);

          // Add round suffix to filename for repeated uploads
          const fileName = enableRepeat && rounds > 1 ? 
            `${file.name.split('.')[0]}_round${round}.${file.name.split('.').pop()}` : 
            file.name;

          console.log(`Testing upload (Round ${round}/${rounds}): ${fileName} (${formatFileSize(file.size)})`);
          
          // Create a new file with the modified name
          const modifiedFile = enableRepeat && rounds > 1 ? 
            new File([file], fileName, { type: file.type }) : 
            file;
          
          const downloadURL = await githubStorage.uploadImage(modifiedFile, 'test-uploads');
          const endTime = Date.now();
          const duration = endTime - startTime;
          const speed = (file.size / 1024) / (duration / 1000); // KB/s

          const result = {
            fileName: fileName,
            originalSize: file.size,
            uploadTime: duration,
            uploadSpeed: speed,
            url: downloadURL,
            status: 'success',
            round: round
          };

          setResults(prev => [...prev, result]);
          completedOperations++;
          
        } catch (error) {
          console.error(`Upload failed for ${file.name} (Round ${round}):`, error);
          
          let errorMessage = error.message;
          if (error.message.includes('Failed to fetch')) {
            errorMessage = 'CORS/Network error - Kiểm tra GitHub token';
          } else if (error.message.includes('400')) {
            errorMessage = 'Bad Request - Token không hợp lệ hoặc hết hạn';
          } else if (error.message.includes('403')) {
            errorMessage = 'Forbidden - Không có quyền truy cập repository';
          }
          
          const result = {
            fileName: enableRepeat && rounds > 1 ? 
              `${file.name.split('.')[0]}_round${round}.${file.name.split('.').pop()}` : 
              file.name,
            originalSize: file.size,
            uploadTime: 0,
            uploadSpeed: 0,
            url: '',
            status: 'failed',
            error: errorMessage,
            round: round
          };

          setResults(prev => [...prev, result]);
          completedOperations++;
        }
      }
    }

    setProgress(100);
    setCurrentRound(0);
    setUploading(false);
  };

  const clearResults = () => {
    setResults([]);
    setError('');
    setCurrentRound(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTotalStats = () => {
    const successful = results.filter(r => r.status === 'success');
    const totalSize = successful.reduce((sum, r) => sum + r.originalSize, 0);
    const totalTime = successful.reduce((sum, r) => sum + r.uploadTime, 0);
    const avgSpeed = successful.length > 0 ? successful.reduce((sum, r) => sum + r.uploadSpeed, 0) / successful.length : 0;

    return {
      totalFiles: results.length,
      successfulUploads: successful.length,
      failedUploads: results.length - successful.length,
      totalSize,
      totalTime,
      avgSpeed
    };
  };

  const stats = getTotalStats();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Assessment color="primary" />
          <Typography variant="h6">GitHub Upload Tester</Typography>
        </Box>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*"
          style={{ display: 'none' }}
        />

        <Box mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={enableRepeat}
                onChange={(e) => setEnableRepeat(e.target.checked)}
                disabled={uploading}
              />
            }
            label="Lặp lại upload để test dung lượng"
          />
          
          {enableRepeat && (
            <Box mb={2}>
              <TextField
                label="Số lần lặp lại"
                type="number"
                value={repeatCount}
                onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={uploading}
                size="small"
                inputProps={{ min: 1, max: 50 }}
                helperText="Tối đa 50 lần để tránh spam"
              />
            </Box>
          )}
          
          <Button
            variant="outlined"
            startIcon={enableRepeat ? <Repeat /> : <CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            fullWidth
          >
            {enableRepeat ? 
              `Chọn file để test upload (${repeatCount} lần)` : 
              'Chọn file để test upload'
            }
          </Button>
        </Box>

        {uploading && (
          <Box mb={2}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary">
              {enableRepeat && currentRound > 0 ? 
                `Đang test upload (Vòng ${currentRound}/${repeatCount})... ${Math.round(progress)}%` :
                `Đang test upload... ${Math.round(progress)}%`
              }
            </Typography>
          </Box>
        )}

        {results.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            
            {/* Thống kê tổng quan */}
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>Thống kê tổng quan:</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label={`${stats.totalFiles} files`} color="default" size="small" />
                <Chip label={`${stats.successfulUploads} thành công`} color="success" size="small" />
                {stats.failedUploads > 0 && (
                  <Chip label={`${stats.failedUploads} thất bại`} color="error" size="small" />
                )}
                <Chip label={`${formatFileSize(stats.totalSize)}`} color="info" size="small" />
                <Chip label={`${formatDuration(stats.totalTime)}`} color="warning" size="small" />
                <Chip label={`${stats.avgSpeed.toFixed(1)} KB/s`} color="secondary" size="small" />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Chi tiết từng file */}
            <Typography variant="subtitle1" gutterBottom>Chi tiết upload:</Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {results.map((result, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="500">
                      {result.fileName}
                      {enableRepeat && result.round && (
                        <Typography component="span" variant="caption" color="text.secondary">
                          {' '}(Vòng {result.round})
                        </Typography>
                      )}
                    </Typography>
                    <Chip 
                      label={result.status} 
                      color={result.status === 'success' ? 'success' : 'error'} 
                      size="small" 
                    />
                  </Box>
                  
                  <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                    <Chip label={formatFileSize(result.originalSize)} size="small" variant="outlined" />
                    {result.status === 'success' && (
                      <>
                        <Chip label={formatDuration(result.uploadTime)} size="small" variant="outlined" />
                        <Chip label={`${result.uploadSpeed.toFixed(1)} KB/s`} size="small" variant="outlined" />
                      </>
                    )}
                  </Box>

                  {result.status === 'failed' && (
                    <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                      Lỗi: {result.error}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>

            <Box mt={2}>
              <Button
                startIcon={<Delete />}
                onClick={clearResults}
                variant="outlined"
                size="small"
              >
                Xóa kết quả
              </Button>
            </Box>
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GitHubUploadTester;