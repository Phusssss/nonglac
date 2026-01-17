import React, { useState, useRef } from 'react';
import { Button, Typography, Progress, Alert, Row, Col, Space } from 'antd';
import { CloudUploadOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { githubStorage } from '../services/githubStorage';

const { Text } = Typography;

const GitHubImageUpload = ({ 
  onUploadComplete, 
  onBatchUploadComplete, // Callback mới cho upload nhiều ảnh
  maxSize = 5, 
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] 
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

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
    if (!allowedTypes.includes(file.type)) {
      return 'Định dạng file không được hỗ trợ';
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File quá lớn. Tối đa ${maxSize}MB`;
    }
    return null;
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
    
    // Create previews for all files
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setPreviews(prev => [...prev, ...newPreviews]);

    try {
      setUploading(true);
      const totalFiles = files.length;
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 0.2) / totalFiles) * 100);

        const compressedFile = await compressImage(file);
        setProgress(((i + 0.5) / totalFiles) * 100);
        
        const downloadURL = await githubStorage.uploadImage(compressedFile, 'nonglac-images');
        uploadedImages.push(downloadURL);
        setProgress(((i + 1) / totalFiles) * 100);
        
        // Gọi callback cho từng ảnh
        if (typeof onUploadComplete === 'function') {
          onUploadComplete(downloadURL);
        }
      }
      
      // Gọi callback cho toàn bộ batch
      if (typeof onBatchUploadComplete === 'function') {
        onBatchUploadComplete(uploadedImages);
      }
      
      setUploadedUrls(prev => [...prev, ...uploadedImages]);
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

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={allowedTypes.join(',')}
        multiple
        style={{ display: 'none' }}
      />

      <Button
        icon={<PictureOutlined />}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        block
        style={{ marginBottom: 16 }}
      >
        {uploading ? 'Đang upload...' : `Chọn ảnh (${previews.length} ảnh đã chọn)`}
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
              {previews.length} ảnh đã chọn
            </Text>
            <Button size="small" onClick={clearAll} danger>
              Xóa tất cả
            </Button>
          </div>
          
          <Row gutter={[8, 8]}>
            {previews.map((preview) => (
              <Col xs={12} sm={8} key={preview.id}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={preview.url}
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
                    onClick={() => removeImage(preview.id)}
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
              </Col>
            ))}
          </Row>
        </div>
      )}

      {uploading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={Math.round(progress)} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Đang upload ảnh... {Math.round(progress)}%
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