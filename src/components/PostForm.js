import React, { useState } from 'react';
import { Card, Input, Button, Select, Tag, Space, Row, Col, Typography, Form } from 'antd';
import { SendOutlined, PictureOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import GitHubImageUpload from './GitHubImageUpload';


const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const PostForm = ({ onPostCreated }) => {
  const { user, userProfile } = useAuth();
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [media, setMedia] = useState([]); // Changed from images to media array
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Trồng trọt',
    'Chăn nuôi', 
    'Thủy sản',
    'Kỹ thuật',
    'Thị trường',
    'Kinh nghiệm',
    'Hỏi đáp',
    'Khác'
  ];

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Handle batch upload of mixed media (images and videos)
  const handleBatchMediaUpload = (uploadedMedia) => {
    console.log('Batch media uploaded:', uploadedMedia);
    setMedia(prev => [...prev, ...uploadedMedia]);
    setShowMediaUpload(false);
  };

  // Handle individual media upload (for backward compatibility)
  const handleMediaUpload = (mediaUrl, mediaType = 'image', fileName = 'uploaded_file', fileSize = 0) => {
    console.log('Media uploaded:', { url: mediaUrl, type: mediaType, fileName, fileSize });
    const mediaItem = {
      url: mediaUrl,
      type: mediaType,
      fileName: fileName,
      fileSize: fileSize
    };
    setMedia(prev => [...prev, mediaItem]);
  };

  const removeMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  // Validate media metadata for consistency
  const validateMediaMetadata = (mediaArray) => {
    const errors = [];
    
    mediaArray.forEach((item, index) => {
      // Validate required fields
      if (!item.url) {
        errors.push(`Media item ${index + 1}: Missing URL`);
      }
      if (!item.type || !['image', 'video'].includes(item.type)) {
        errors.push(`Media item ${index + 1}: Invalid or missing type`);
      }
      if (!item.fileName) {
        errors.push(`Media item ${index + 1}: Missing filename`);
      }
      
      // Validate file size
      if (item.fileSize && typeof item.fileSize !== 'number') {
        errors.push(`Media item ${index + 1}: Invalid file size`);
      }
      
      // Video-specific validation
      if (item.type === 'video') {
        if (item.duration && typeof item.duration !== 'number') {
          errors.push(`Media item ${index + 1}: Invalid video duration`);
        }
        if (item.resolution && (!item.resolution.width || !item.resolution.height)) {
          errors.push(`Media item ${index + 1}: Invalid video resolution`);
        }
      }
    });
    
    return errors;
  };

  const handleSubmit = async (values) => {
    if (!user || !values.title?.trim() || !values.content?.trim()) return;

    setLoading(true);
    try {
      // Validate media metadata
      const validationErrors = validateMediaMetadata(media);
      if (validationErrors.length > 0) {
        console.warn('Media validation warnings:', validationErrors);
        // Continue with submission but log warnings
      }
      // Determine post type based on media content
      let postType = 'text';
      if (media.length > 0) {
        const hasVideo = media.some(item => item.type === 'video');
        const hasImage = media.some(item => item.type === 'image');
        
        if (hasVideo && hasImage) {
          postType = 'mixed';
        } else if (hasVideo) {
          postType = 'video';
        } else {
          postType = 'image';
        }
      }

      const postData = {
        title: values.title,
        content: values.content,
        category: values.category,
        authorId: user.uid,
        authorName: userProfile?.displayName || user.displayName,
        authorReputation: userProfile?.reputation || 0,
        media: media, // New media array structure
        images: media.filter(item => item.type === 'image').map(item => item.url), // Backward compatibility
        type: postType,
        likes: 0,
        comments: 0,
        createdAt: new Date()
      };
      
      console.log('Post data before submit:', postData);

      const docRef = await addDoc(collection(db, 'posts'), postData);
      
      // Update user posts count
      if (userProfile) {
        await updateDoc(doc(db, 'users', user.uid), {
          postsCount: (userProfile.postsCount || 0) + 1
        });
      }

      // Reset form
      form.resetFields();
      setFormData({ title: '', content: '', category: '' });
      setMedia([]);
      
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setLoading(false);
  };

  return (
    <Card style={{ marginBottom: 24 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={formData}
      >
        <Form.Item
          name="title"
          label="Tiêu đề bài viết"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
        >
          <Input
            placeholder="Nhập tiêu đề bài viết..."
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </Form.Item>

        <Form.Item
          name="content"
          label="Nội dung"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
        >
          <TextArea
            rows={4}
            placeholder="Chia sẻ kiến thức, kinh nghiệm của bạn..."
            onChange={(e) => handleChange('content', e.target.value)}
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
        >
          <Select
            placeholder="Chọn danh mục"
            onChange={(value) => handleChange('category', value)}
          >
            {categories.map(category => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {media.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Media đã chọn ({media.length}):</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {media.map((item, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => removeMedia(index)}
                    color={item.type === 'video' ? 'blue' : 'green'}
                    icon={item.type === 'video' ? <VideoCameraOutlined /> : <PictureOutlined />}
                    style={{ 
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>
                      {item.type === 'video' ? 'Video' : 'Ảnh'} {index + 1}
                      {item.fileSize > 0 && (
                        <Text type="secondary" style={{ fontSize: '10px', marginLeft: '4px' }}>
                          ({(item.fileSize / (1024 * 1024)).toFixed(1)}MB)
                        </Text>
                      )}
                    </span>
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        )}

        {showMediaUpload && (
          <div style={{ marginBottom: 16 }}>
            <GitHubImageUpload 
              onUploadComplete={handleMediaUpload}
              onBatchUploadComplete={handleBatchMediaUpload}
              supportVideo={true}
              maxSize={5} // 5MB for images
              maxVideoSize={100} // 100MB for videos
              allowMultiple={true}
            />
          </div>
        )}

        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<PictureOutlined />}
                onClick={() => setShowMediaUpload(!showMediaUpload)}
                type={showMediaUpload ? "primary" : "default"}
                style={{ 
                  borderColor: showMediaUpload ? undefined : '#d9d9d9'
                }}
              >
                {showMediaUpload ? 'Ẩn upload' : 'Thêm ảnh/video'}
              </Button>
              {media.length > 0 && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {media.filter(m => m.type === 'image').length} ảnh, {media.filter(m => m.type === 'video').length} video
                </Text>
              )}
            </Space>
          </Col>

          <Col>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={loading}
              disabled={!formData.title?.trim() || !formData.content?.trim()}
            >
              {loading ? 'Đang đăng...' : 'Đăng bài'}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default PostForm;