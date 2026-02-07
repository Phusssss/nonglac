import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Space, message, Row, Col, Typography } from 'antd';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { FileEdit, Send } from 'lucide-react';

const { Title, Text } = Typography;

const AdminPostCreator = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const postData = {
        ...values,
        authorId: 'admin_system',
        authorName: 'Hệ thống NôngLạc',
        authorAvatar: null,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isAdminPost: true
      };

      await addDoc(collection(db, 'posts'), postData);
      message.success('Đã tạo bài viết thành công!');
      form.resetFields();
    } catch (error) {
      message.error('Lỗi khi tạo bài viết: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card 
        bordered={false} 
        className="shadow-sm rounded-2xl overflow-hidden"
        title={
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 bg-agri-100 rounded-xl flex items-center justify-center">
              <FileEdit className="text-agri-600 w-6 h-6" />
            </div>
            <div>
              <Title level={4} className="m-0">Tạo bài viết hệ thống</Title>
              <Text type="secondary" className="text-xs">Đăng tin tức hoặc thông báo chính thức</Text>
            </div>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ category: 'news' }}
        >
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item
                name="title"
                label={<Text strong>Tiêu đề bài viết</Text>}
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input placeholder="Ví dụ: Cập nhật giá lúa hôm nay tại ĐBSCL" className="h-12 rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="category"
                label={<Text strong>Danh mục</Text>}
                rules={[{ required: true }]}
              >
                <Select className="h-12 rounded-xl">
                  <Select.Option value="news">Tin tức nông nghiệp</Select.Option>
                  <Select.Option value="market">Thị trường</Select.Option>
                  <Select.Option value="tech">Kỹ thuật canh tác</Select.Option>
                  <Select.Option value="policy">Chính sách & Pháp luật</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="content"
            label={<Text strong>Nội dung chi tiết</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea 
              rows={8} 
              placeholder="Nhập nội dung bài viết..." 
              className="rounded-xl p-4"
            />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label={<Text strong>URL Hình ảnh (tùy chọn)</Text>}
          >
            <Input placeholder="https://example.com/image.jpg" className="h-12 rounded-xl" />
          </Form.Item>

          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <Space>
              <Button onClick={() => form.resetFields()} className="h-12 px-8 rounded-xl">
                Làm mới
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<Send className="w-4 h-4" />}
                className="bg-agri-600 border-none h-12 px-10 rounded-xl font-bold flex items-center gap-2"
              >
                Đăng bài ngay
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AdminPostCreator;