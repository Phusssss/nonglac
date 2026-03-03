import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Typography, Progress, Alert, Row, Col, Space, Card, Tag } from 'antd';
import { CloudUploadOutlined, DeleteOutlined, PictureOutlined, VideoCameraOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { firebaseStorageService } from '../services/firebaseStorageService';
import { validateVideoFileOnly } from '../components/common/VideoFileValidator';
import { generateVideoThumbnail } from '../utils/videoValidation';

const { Text } = Typography;

const GitHubImageUpload = forwardRef(({
  onUploadComplete,
  onBatchUploadComplete,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  folder = 'nonglac-images',
  supportVideo = true,
  maxVideoSize = 100,
  allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-matroska'],
  autoUpload = false
}, ref) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [validatingVideo, setValidatingVideo] = useState(false);
  const fileInputRef = useRef(null);
  const previewsRef = useRef([]);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  const getAllowedTypes = () => {
    const types = [...allowedTypes];
    if (supportVideo) {
      types.push(...allowedVideoTypes);
    }
    return types;
  };

  const isVideoFile = (file) => supportVideo && allowedVideoTypes.includes(file.type);
  const isImageFile = (file) => allowedTypes.includes(file.type);

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
    if (!isVideo && file.size > maxFileSize * 1024 * 1024) {
      return `File quá lớn. Tối đa ${maxFileSize}MB cho ${isVideo ? 'video' : 'ảnh'}`;
    }

    return null;
  };

  const generateVideoPreview = async (file) => {
    try {
      return await generateVideoThumbnail(file, 1);
    } catch (thumbnailError) {
      console.warn('Failed to generate video thumbnail:', thumbnailError);
      return null;
    }
  };

  const dataUrlToFile = (dataUrl, fileName) => {
    const [meta, base64Data] = dataUrl.split(',');
    const mimeMatch = meta.match(/data:(.*?);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], fileName, { type: mimeType });
  };

  const uploadPreviewItems = async (items) => {
    if (!items || items.length === 0) {
      return [];
    }

    setUploading(true);
    setError('');

    try {
      const uploadedMedia = [];

      for (let i = 0; i < items.length; i++) {
        const preview = items[i];
        if (preview.uploadedMedia) {
          uploadedMedia.push(preview.uploadedMedia);
          continue;
        }

        const file = preview.file;
        const isVideo = preview.isVideo;

        setProgress(((i + 0.2) / items.length) * 100);

        let uploaded;
        if (isVideo) {
          uploaded = await firebaseStorageService.uploadVideo(file, {
            folder: 'posts-videos',
            maxSizeMB: maxVideoSize,
            autoCompress: true,
            alwaysCompress: true,
            targetWidth: 854,
            targetHeight: 480,
            targetBitrate: 620000
          });
        } else {
          setProgress(((i + 0.5) / items.length) * 100);
          uploaded = await firebaseStorageService.uploadImage(file, {
            folder,
            maxSizeMB: maxSize,
            maxWidth: 1280,
            maxHeight: 1280,
            quality: 0.7,
            outputType: 'image/webp'
          });
        }

        let thumbnailUrl;
        if (isVideo && preview.thumbnailUrl && preview.thumbnailUrl.startsWith('data:')) {
          try {
            const thumbnailFile = dataUrlToFile(preview.thumbnailUrl, `${Date.now()}_${file.name}_thumb.jpg`);
            const uploadedThumb = await firebaseStorageService.uploadImage(thumbnailFile, {
              folder: 'posts-thumbnails',
              maxSizeMB: 2,
              maxWidth: 640,
              maxHeight: 360,
              quality: 0.72,
              outputType: 'image/webp'
            });
            thumbnailUrl = uploadedThumb.url;
          } catch (thumbError) {
            console.warn('Thumbnail upload failed:', thumbError);
          }
        }

        const mediaItem = {
          url: uploaded.url,
          type: isVideo ? 'video' : 'image',
          fileName: file.name,
          fileSize: uploaded.uploadedSize || file.size,
          originalFileSize: file.size,
          wasCompressed: Boolean(uploaded.wasCompressed),
          thumbnailUrl
        };

        uploadedMedia.push(mediaItem);

        setPreviews((prev) => prev.map((p) => (
          p.id === preview.id
            ? { ...p, uploadedMedia: mediaItem }
            : p
        )));

        setProgress(((i + 1) / items.length) * 100);

        if (typeof onUploadComplete === 'function') {
          onUploadComplete(uploaded.url);
        }
      }

      if (typeof onBatchUploadComplete === 'function') {
        onBatchUploadComplete(uploadedMedia);
      }

      return uploadedMedia;
    } catch (uploadError) {
      setError('Lỗi upload: ' + uploadError.message);
      throw uploadError;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  useImperativeHandle(ref, () => ({
    uploadSelectedFiles: async () => {
      const pending = previewsRef.current.filter((item) => !item.uploadedMedia);
      return uploadPreviewItems(pending);
    },
    getSelectedPreviewItems: () => (
      previewsRef.current.map((item) => ({
        id: item.id,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl || null,
        isVideo: Boolean(item.isVideo),
        fileName: item.file?.name || null
      }))
    ),
    clearAll: () => {
      previewsRef.current.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
      previewsRef.current = [];
      setPreviews([]);
      setError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }));

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

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
      const newPreviews = [];

      for (const file of files) {
        const isVideo = isVideoFile(file);
        const previewUrl = URL.createObjectURL(file);
        let thumbnailUrl = null;
        let validationResult = null;

        if (isVideo) {
          validationResult = await validateVideoFileOnly(file, {
            maxSize: Math.max(maxVideoSize * 1024 * 1024, file.size + 1),
            maxResolution: null,
            maxDuration: null,
            minDuration: null
          });
          if (!validationResult?.isValid) {
            setError(`${file.name}: Video validation failed - ${validationResult?.errors?.[0]?.message || 'Unknown error'}`);
            URL.revokeObjectURL(previewUrl);
            setValidatingVideo(false);
            return;
          }
          thumbnailUrl = await generateVideoPreview(file);
        }

        newPreviews.push({
          file,
          url: previewUrl,
          thumbnailUrl,
          isVideo,
          validationResult,
          uploadedMedia: null,
          id: Date.now() + Math.random()
        });
      }

      setPreviews((prev) => [...prev, ...newPreviews]);

      if (autoUpload === true) {
        await uploadPreviewItems(newPreviews);
      }
    } catch (processError) {
      setError(`Lỗi xử lý file: ${processError.message}`);
    } finally {
      setValidatingVideo(false);
    }
  };

  const removeImage = (id) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const clearAll = () => {
    previewsRef.current.forEach((item) => {
      if (item.url) URL.revokeObjectURL(item.url);
    });
    setPreviews([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    }

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

      {!autoUpload && previews.length > 0 && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          File sẽ được upload khi bạn bấm Đăng bài.
        </Text>
      )}

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
            status={validatingVideo ? 'active' : 'normal'}
            strokeColor={validatingVideo ? '#1890ff' : undefined}
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
});

export default GitHubImageUpload;
