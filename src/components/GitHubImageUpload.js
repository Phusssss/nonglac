import React, { useState, useRef } from 'react';
import { Button, Typography, Progress, Alert, Row, Col, Space, Card, Tag } from 'antd';
import { CloudUploadOutlined, DeleteOutlined, PictureOutlined, VideoCameraOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { githubStorage } from '../services/githubStorageExtended';
import { validateVideoFileOnly } from '../components/common/VideoFileValidator';
import { generateVideoThumbnail } from '../utils/videoValidation';

const { Text } = Typography;

const GitHubImageUpload = ({ 
  onUploadComplete, 
  onBatchUploadComplete, // Callback mới cho upload nhiều ảnh
  maxSize = 5, 
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  supportVideo = true, // New prop to enable video support
  maxVideoSize = 100, // Max video size in MB
  allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-matroska']
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [error, setError] = useState('');
  const [validatingVideo, setValidatingVideo] = useState(false);
  const fileInputRef = useRef();

  // Combine allowed types for both images and videos
  const getAllowedTypes = () => {
    const types = [...allowedTypes];
    if (supportVideo) {
      types.push(...allowedVideoTypes);
    }
    return types;
  };

  // Check if file is a video
  const isVideoFile = (file) => {
    return supportVideo && allowedVideoTypes.includes(file.type);
  };

  // Check if file is an image
  const isImageFile = (file) => {
    return allowedTypes.includes(file.type);
  };

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          // Preserve original file name
          blob.name = file.name;
          resolve(blob);
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const validateFile = (file) => {
    const isVideo = isVideoFile(file);
    const isImage = isImageFile(file);
    
    if (!isVideo && !isImage) {
      const supportedFormats = supportVideo 
        ? [...allowedTypes, ...allowedVideoTypes].join(', ')
        : allowedTypes.join(', ');
      return `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${supportedFormats}`;
    }
    
    const maxFileSize = isVideo ? maxVideoSize : maxSize;
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File quá lớn. Tối đa ${maxFileSize}MB cho ${isVideo ? 'video' : 'ảnh'}`;
    }
    
    return null;
  };

  // Generate video thumbnail
  const generateVideoPreview = async (file) => {
    try {
      const thumbnailBase64 = await generateVideoThumbnail(file, 1);
      return thumbnailBase64;
    } catch (error) {
      console.warn('Failed to generate video thumbnail:', error);
      return null;
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate all files
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        return;
      }
    }

    setError('');
    setValidatingVideo(true);
    
    try {
      // Create previews for all files
      const newPreviews = [];
      
      for (const file of files) {
        const isVideo = isVideoFile(file);
        let previewUrl = URL.createObjectURL(file);
        let thumbnailUrl = null;
        let validationResult = null;
        
        if (isVideo) {
          // Validate video file
          validationResult = await validateVideoFileOnly(file);
          if (!validationResult?.isValid) {
            setError(`${file.name}: Video validation failed - ${validationResult?.errors?.[0]?.message || 'Unknown error'}`);
            setValidatingVideo(false);
            return;
          }
          
          // Generate thumbnail for video
          thumbnailUrl = await generateVideoPreview(file);
        }
        
        newPreviews.push({
          file,
          url: previewUrl,
          thumbnailUrl,
          isVideo,
          validationResult,
          id: Date.now() + Math.random()
        });
      }
      
      setPreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      setError(`Lỗi xử lý file: ${error.message}`);
    } finally {
      setValidatingVideo(false);
    }

    try {
      setUploading(true);
      const totalFiles = files.length;
      const uploadedMedia = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = isVideoFile(file);
        
        setProgress(((i + 0.2) / totalFiles) * 100);

        let downloadURL;
        
        if (isVideo) {
          // Upload video using video service
          const uniquePath = `videos/user-${Date.now()}/${Date.now()}_${file.name}`;
          downloadURL = await githubStorage.uploadVideo(file, uniquePath);
        } else {
          // Upload image using existing logic
          const compressedFile = await compressImage(file);
          setProgress(((i + 0.5) / totalFiles) * 100);
          downloadURL = await githubStorage.uploadImage(compressedFile, 'nonglac-images');
        }
        
        uploadedMedia.push({
          url: downloadURL,
          type: isVideo ? 'video' : 'image',
          fileName: file.name,
          fileSize: file.size
        });
        
        setProgress(((i + 1) / totalFiles) * 100);
        
        // Gọi callback cho từng file
        if (typeof onUploadComplete === 'function') {
          onUploadComplete(downloadURL);
        }
      }
      
      // Gọi callback cho toàn bộ batch
      if (typeof onBatchUploadComplete === 'function') {
        onBatchUploadComplete(uploadedMedia);
      }
      
      setUploadedUrls(prev => [...prev, ...uploadedMedia.map(m => m.url)]);
    } catch (error) {
      setError('Lỗi upload: ' + error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeImage = (id) => {
    setPreviews(prev => prev.filter(p => p.id !== id));
  };

  const clearAll = () => {
    setPreviews([]);
    setUploadedUrls([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render preview for individual file
  const renderFilePreview = (preview) => {
    const { file, url, thumbnailUrl, isVideo, validationResult, id } = preview;
    
    if (isVideo) {
      return (
        <Card
          size="small"
          style={{ position: 'relative' }}
          cover={
            <div style={{ position: 'relative', height: '80px', overflow: 'hidden' }}>
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Video thumbnail"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  <VideoCameraOutlined style={{ fontSize: '24px', color: '#999' }} />
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontSize: '20px',
                  textShadow: '0 0 4px rgba(0,0,0,0.5)'
                }}
              >
                <PlayCircleOutlined />
              </div>
              <Tag
                color="blue"
                size="small"
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  fontSize: '10px'
                }}
              >
                VIDEO
              </Tag>
            </div>
          }
          actions={[
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removeImage(id)}
            />
          ]}
        >
          <Card.Meta
            title={
              <Typography.Text ellipsis style={{ fontSize: '12px' }}>
                {file.name}
              </Typography.Text>
            }
            description={
              <Space direction="vertical" size="small">
                <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                  {(file.size / (1024 * 1024)).toFixed(1)}MB
                </Typography.Text>
                {validationResult?.fileInfo && (
                  <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                    {Math.round(validationResult.fileInfo.duration)}s
                  </Typography.Text>
                )}
              </Space>
            }
          />
        </Card>
      );
    } else {
      // Existing image preview
      return (
        <div style={{ position: 'relative' }}>
          <img
            src={url}
            alt="Preview"
            style={{
              width: '100%',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => removeImage(id)}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 24,
              height: 24,
              padding: 0,
              minWidth: 24
            }}
          />
        </div>
      );
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={getAllowedTypes().join(',')}
        multiple
        style={{ display: 'none' }}
      />

      <Button
        icon={supportVideo ? <CloudUploadOutlined /> : <PictureOutlined />}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || validatingVideo}
        block
        style={{ marginBottom: 16 }}
        type="dashed"
      >
        {uploading 
          ? 'Đang upload...' 
          : validatingVideo 
            ? 'Đang xác thực...'
            : supportVideo 
              ? `Chọn ảnh/video (${previews.length} file đã chọn)`
              : `Chọn ảnh (${previews.length} ảnh đã chọn)`
        }
      </Button>

      {previews.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 8 
          }}>
            <Text type="secondary">
              {previews.length} {supportVideo ? 'file' : 'ảnh'} đã chọn
            </Text>
            <Button size="small" onClick={clearAll} danger>
              Xóa tất cả
            </Button>
          </div>
          
          <Row gutter={[8, 8]}>
            {previews.map((preview) => (
              <Col xs={12} sm={8} key={preview.id}>
                {renderFilePreview(preview)}
              </Col>
            ))}
          </Row>
        </div>
      )}

      {(uploading || validatingVideo) && (
        <div style={{ marginTop: 16 }}>
          <Progress 
            percent={Math.round(progress)} 
            status={validatingVideo ? "active" : "normal"}
            strokeColor={validatingVideo ? "#1890ff" : undefined}
          />
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            {validatingVideo 
              ? 'Đang xác thực video...'
              : `Đang upload ${supportVideo ? 'file' : 'ảnh'}... ${Math.round(progress)}%`
            }
          </Text>
        </div>
      )}

      {error && (
        <Alert 
          message={error}
          type="error" 
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default GitHubImageUpload;