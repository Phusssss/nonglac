import React, { useState, useEffect } from 'react';
import { Layout, Tree, Card, Button, Modal, Form, Input, Select, Space, Typography, Breadcrumb } from 'antd';
import { PlusOutlined, BookOutlined, FileTextOutlined, FolderOutlined } from '@ant-design/icons';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import LessonEditor from '../components/LessonEditor';

const { Content, Sider } = Layout;
const { Title } = Typography;

const Lessons = () => {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'category', 'crop', 'chapter', 'lesson'
  const [currentLesson, setCurrentLesson] = useState(null);
  const [form] = Form.useForm();

  const cropTypes = [
    'Lúa', 'Ngô', 'Cà phê', 'Cao su', 'Tiêu', 'Dừa', 
    'Xoài', 'Chuối', 'Rau màu', 'Hoa màu', 'Cây ăn quả'
  ];

  useEffect(() => {
    loadLessonsData();
  }, []);

  const loadLessonsData = async () => {
    try {
      const lessonsRef = collection(db, 'lessons');
      const snapshot = await getDocs(query(lessonsRef, orderBy('createdAt', 'asc')));
      const lessons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const tree = buildTreeStructure(lessons);
      setTreeData(tree);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const buildTreeStructure = (lessons) => {
    const categories = {};
    
    lessons.forEach(lesson => {
      const { category, crop, chapter, type } = lesson;
      
      if (!categories[category]) {
        categories[category] = {
          title: category,
          key: `cat-${category}`,
          icon: <FolderOutlined />,
          children: {}
        };
      }
      
      if (!categories[category].children[crop]) {
        categories[category].children[crop] = {
          title: crop,
          key: `crop-${category}-${crop}`,
          icon: <BookOutlined />,
          children: {}
        };
      }
      
      if (type === 'chapter') {
        categories[category].children[crop].children[chapter] = {
          title: chapter,
          key: `chapter-${category}-${crop}-${chapter}`,
          icon: <FolderOutlined />,
          children: {}
        };
      } else if (type === 'lesson') {
        const chapterKey = categories[category].children[crop].children[chapter];
        if (!chapterKey) {
          categories[category].children[crop].children[chapter] = {
            title: chapter,
            key: `chapter-${category}-${crop}-${chapter}`,
            icon: <FolderOutlined />,
            children: {}
          };
        }
        
        categories[category].children[crop].children[chapter].children[lesson.id] = {
          title: lesson.title,
          key: `lesson-${lesson.id}`,
          icon: <FileTextOutlined />,
          isLeaf: true,
          lessonData: lesson
        };
      }
    });
    
    return Object.values(categories).map(cat => ({
      ...cat,
      children: Object.values(cat.children).map(crop => ({
        ...crop,
        children: Object.values(crop.children).map(chapter => ({
          ...chapter,
          children: Object.values(chapter.children)
        }))
      }))
    }));
  };

  const handleAddNew = (type) => {
    setModalType(type);
    setModalVisible(true);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const lessonData = {
        ...values,
        type: modalType,
        createdAt: new Date(),
        authorId: user.uid,
        authorName: user.displayName || user.email
      };

      await addDoc(collection(db, 'lessons'), lessonData);
      setModalVisible(false);
      loadLessonsData();
    } catch (error) {
      console.error('Error creating lesson:', error);
    }
  };

  const onSelect = (keys, info) => {
    setSelectedKeys(keys);
    if (info.node.isLeaf && info.node.lessonData) {
      setCurrentLesson(info.node.lessonData);
    } else {
      setCurrentLesson(null);
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'category':
        return (
          <Form.Item name="category" label="Tên loại cây trồng" rules={[{ required: true }]}>
            <Input placeholder="VD: Cây lương thực" />
          </Form.Item>
        );
      case 'crop':
        return (
          <>
            <Form.Item name="category" label="Loại cây trồng" rules={[{ required: true }]}>
              <Select placeholder="Chọn loại cây trồng">
                {cropTypes.map(type => (
                  <Select.Option key={type} value={type}>{type}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="crop" label="Tên cây trồng" rules={[{ required: true }]}>
              <Input placeholder="VD: Lúa tẻ" />
            </Form.Item>
          </>
        );
      case 'chapter':
        return (
          <>
            <Form.Item name="category" label="Loại cây trồng" rules={[{ required: true }]}>
              <Select placeholder="Chọn loại cây trồng">
                {cropTypes.map(type => (
                  <Select.Option key={type} value={type}>{type}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="crop" label="Cây trồng" rules={[{ required: true }]}>
              <Input placeholder="Tên cây trồng" />
            </Form.Item>
            <Form.Item name="chapter" label="Tên chương" rules={[{ required: true }]}>
              <Input placeholder="VD: Kỹ thuật gieo trồng" />
            </Form.Item>
          </>
        );
      case 'lesson':
        return (
          <>
            <Form.Item name="category" label="Loại cây trồng" rules={[{ required: true }]}>
              <Select placeholder="Chọn loại cây trồng">
                {cropTypes.map(type => (
                  <Select.Option key={type} value={type}>{type}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="crop" label="Cây trồng" rules={[{ required: true }]}>
              <Input placeholder="Tên cây trồng" />
            </Form.Item>
            <Form.Item name="chapter" label="Chương" rules={[{ required: true }]}>
              <Input placeholder="Tên chương" />
            </Form.Item>
            <Form.Item name="title" label="Tiêu đề bài học" rules={[{ required: true }]}>
              <Input placeholder="VD: Cách chọn giống lúa" />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px' }}>
          <Title level={4}>Bài học nông nghiệp</Title>
          <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
            <Button icon={<PlusOutlined />} onClick={() => handleAddNew('category')} block>
              Thêm loại cây trồng
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => handleAddNew('crop')} block>
              Thêm cây trồng
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => handleAddNew('chapter')} block>
              Thêm chương
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => handleAddNew('lesson')} block type="primary">
              Thêm bài học
            </Button>
          </Space>
          
          <Tree
            showIcon
            treeData={treeData}
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            onSelect={onSelect}
            onExpand={setExpandedKeys}
          />
        </div>
      </Sider>
      
      <Content style={{ padding: '16px', background: '#f0f2f5' }}>
        {currentLesson ? (
          <LessonEditor lesson={currentLesson} onSave={loadLessonsData} />
        ) : (
          <Card style={{ textAlign: 'center', height: '100%' }}>
            <Title level={3} type="secondary">
              Chọn một bài học để xem nội dung
            </Title>
          </Card>
        )}
      </Content>

      <Modal
        title={`Thêm ${modalType === 'category' ? 'loại cây trồng' : modalType === 'crop' ? 'cây trồng' : modalType === 'chapter' ? 'chương' : 'bài học'}`}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          {renderModalContent()}
        </Form>
      </Modal>
    </Layout>
  );
};

export default Lessons;