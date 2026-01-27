import React, { useState } from 'react';
import { Card, Button, Form, Input, Space, Typography, Table, Tag, Popconfirm, Row, Col, Select, message } from 'antd';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const { Title } = Typography;

const CategoryManagement = ({ categories, setCategories }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const addCategory = async (values) => {
    try {
      const docRef = await addDoc(collection(db, 'priceCategories'), { 
        name: values.name.trim(), 
        createdAt: new Date() 
      });
      setCategories([...categories, { id: docRef.id, name: values.name.trim() }]);
      form.resetFields();
      setShowForm(false);
      message.success('Đã thêm danh mục');
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const updateCategory = async (values) => {
    try {
      await updateDoc(doc(db, 'priceCategories', editing.id), { name: values.name.trim() });
      setCategories(categories.map(c => c.id === editing.id ? { ...c, name: values.name.trim() } : c));
      setEditing(null);
      form.resetFields();
      message.success('Đã cập nhật');
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, 'priceCategories', id));
      setCategories(categories.filter(c => c.id !== id));
      message.success('Đã xóa');
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  return (
    <Card title={`Danh mục giá nông sản (${categories.length})`} className="mb-6 shadow-sm border-none">
      <div className="mb-4">
        <Button type="primary" onClick={() => setShowForm(true)} className="bg-agri-600 border-none h-10 px-6">Thêm danh mục mới</Button>
      </div>
      {(showForm || editing) && (
        <Card className="mb-4 bg-gray-50" size="small">
          <Form form={form} layout="vertical" onFinish={editing ? updateCategory : addCategory} className="sm:flex sm:items-end gap-4">
            <Form.Item name="name" label="Tên danh mục" className="mb-4 sm:mb-0 flex-1" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
              <Input placeholder="Ví dụ: Rau củ, Trái cây..." className="h-10" />
            </Form.Item>
            <Form.Item className="mb-0">
              <Space>
                <Button type="primary" htmlType="submit" className="bg-agri-600 border-none h-10 px-6">{editing ? 'Cập nhật' : 'Lưu lại'}</Button>
                <Button onClick={() => { setEditing(null); setShowForm(false); form.resetFields(); }} className="h-10">Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm hover:border-agri-300 transition-colors">
            <span className="font-medium text-gray-700">{cat.name}</span>
            <div className="flex gap-1">
              <Button size="small" type="text" className="text-agri-600 p-0 h-auto" onClick={() => { setEditing(cat); form.setFieldsValue({ name: cat.name }); }}>Sửa</Button>
              <span className="text-gray-300">|</span>
              <Popconfirm title="Xác nhận xóa?" onConfirm={() => deleteCategory(cat.id)}>
                <Button size="small" type="text" danger className="p-0 h-auto">Xóa</Button>
              </Popconfirm>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const PriceManagement = ({ prices, setPrices, categories, setCategories }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [form] = Form.useForm();

  const addPrice = async (values) => {
    try {
      const newPrice = { 
        ...values, 
        currentPrice: parseFloat(values.currentPrice), 
        previousPrice: parseFloat(values.currentPrice) * 0.98, 
        updatedAt: new Date() 
      };
      const docRef = await addDoc(collection(db, 'prices'), newPrice);
      setPrices([{ id: docRef.id, ...newPrice }, ...prices]);
      form.resetFields();
      setShowAddForm(false);
      message.success('Đã thêm giá sản phẩm');
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const updatePrice = async (values) => {
    try {
      await updateDoc(doc(db, 'prices', editingPrice.id), { 
        ...values, 
        currentPrice: parseFloat(values.currentPrice), 
        updatedAt: new Date() 
      });
      setPrices(prices.map(p => p.id === editingPrice.id ? { ...p, ...values, currentPrice: parseFloat(values.currentPrice) } : p));
      setEditingPrice(null);
      form.resetFields();
      message.success('Đã cập nhật giá');
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const deletePrice = async (id) => {
    try {
      await deleteDoc(doc(db, 'prices', id));
      setPrices(prices.filter(p => p.id !== id));
      message.success('Đã xóa');
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const columns = [
    { 
      title: 'Sản phẩm', 
      dataIndex: 'productName', 
      key: 'productName',
      fixed: 'left',
      width: 180,
      render: (text) => <span className="font-bold text-gray-800">{text}</span>
    },
    { 
      title: 'Giá hiện tại', 
      dataIndex: 'currentPrice', 
      key: 'currentPrice', 
      width: 150,
      render: (price) => <span className="text-agri-600 font-bold">{new Intl.NumberFormat('vi-VN').format(price)}đ</span> 
    },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', width: 100 },
    { title: 'Thị trường', dataIndex: 'market', key: 'market', width: 150 },
    { 
      title: 'Danh mục', 
      dataIndex: 'category', 
      key: 'category', 
      width: 130,
      render: (cat) => cat ? <Tag color="green" className="m-0">{cat}</Tag> : '-' 
    },
    { 
      title: 'Hành động', 
      key: 'actions', 
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => { setEditingPrice(record); form.setFieldsValue({ ...record }); }} className="bg-agri-500 border-none">Sửa</Button>
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => deletePrice(record.id)}>
            <Button size="small" danger type="text">Xóa</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <CategoryManagement categories={categories} setCategories={setCategories} />
      
      <Card 
        title={<Title level={3} className="m-0 text-xl">Quản lý giá nông sản</Title>} 
        extra={<Button type="primary" onClick={() => setShowAddForm(true)} className="bg-agri-600 border-none">Thêm mặt hàng</Button>}
        className="shadow-sm border-none"
      >
        {(showAddForm || editingPrice) && (
          <Card className="mb-6 bg-gray-50 border-agri-100" size="small">
            <Title level={4} className="mb-4 text-agri-700">{editingPrice ? 'Cập nhật giá sản phẩm' : 'Thêm sản phẩm mới'}</Title>
            <Form form={form} layout="vertical" onFinish={editingPrice ? updatePrice : addPrice}>
              <Row gutter={[16, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item name="productName" label="Tên sản phẩm" rules={[{ required: true }]}>
                    <Input placeholder="Ví dụ: Lúa OM 5451" className="h-10" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="currentPrice" label="Giá hiện tại (VNĐ)" rules={[{ required: true }]}>
                    <Input type="number" placeholder="Nhập số tiền" className="h-10" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true }]}>
                    <Input placeholder="Ví dụ: kg, tấn..." className="h-10" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="market" label="Thị trường/Khu vực" rules={[{ required: true }]}>
                    <Input placeholder="Ví dụ: An Giang, Cần Thơ..." className="h-10" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="category" label="Danh mục">
                    <Select placeholder="Chọn danh mục" allowClear className="h-10">
                      {categories.map(cat => <Select.Option key={cat.id} value={cat.name}>{cat.name}</Select.Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item className="mb-0 mt-2">
                <Space>
                  <Button type="primary" htmlType="submit" className="bg-agri-600 border-none h-10 px-8">
                    {editingPrice ? 'Cập nhật ngay' : 'Thêm vào danh sách'}
                  </Button>
                  <Button onClick={() => { setEditingPrice(null); setShowAddForm(false); form.resetFields(); }} className="h-10">
                    Hủy bỏ
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}
        <Table 
          columns={columns} 
          dataSource={prices} 
          rowKey="id" 
          pagination={{ pageSize: 10, showSizeChanger: true }} 
          scroll={{ x: 1000 }} 
          size="middle"
        />
      </Card>
    </div>
  );
};

export default PriceManagement;