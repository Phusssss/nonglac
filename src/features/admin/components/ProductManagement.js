import React from 'react';
import { Card, Table, Tag, Popconfirm, Button, message } from 'antd';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const ProductManagement = ({ products, setProducts }) => {
  const handleDelete = async (productId) => {
    try {
      await deleteDoc(doc(db, 'marketplace_products', productId));
      setProducts(products.filter(p => p.id !== productId));
      message.success('Đã xóa sản phẩm');
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const columns = [
    { title: 'Ảnh', key: 'image', width: 80, render: (_, record) => <img src={record.imageUrls?.[0] || record.images?.[0] || 'https://via.placeholder.com/50'} alt={record.name} className="w-12 h-12 object-cover rounded shadow-sm" /> },
    { title: 'Sản phẩm', key: 'product', render: (_, record) => (<div><div className="font-medium text-gray-900">{record.name || record.productName}</div><div className="text-xs text-gray-500 line-clamp-1">{record.description}</div></div>) },
    { title: 'Giá & SL', key: 'price', render: (_, record) => (<div><div className="text-sm font-bold text-green-600">{new Intl.NumberFormat('vi-VN').format(record.price)}đ/{record.unit}</div><div className="text-xs text-gray-500">Kho: {record.quantity || 0}</div></div>) },
    { title: 'Danh mục', key: 'category', render: (_, record) => <Tag color="blue">{record.category || record.productType}</Tag> },
    { title: 'Liên hệ', key: 'contact', render: (_, record) => (<div><div className="text-sm font-medium">{record.supplier || record.sellerName}</div><div className="text-xs text-gray-500">{record.phone}</div></div>) },
    { title: 'Hành động', key: 'actions', render: (_, record) => (
      <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}><Button size="small" danger>Xóa</Button></Popconfirm>
    )},
  ];

  return (
    <Card title={`Quản lý sản phẩm (${products.length})`}>
      <Table columns={columns} dataSource={products.slice(0, 50)} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
    </Card>
  );
};

export default ProductManagement;