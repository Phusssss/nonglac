import React, { useState, useEffect } from 'react';
import { Layout, Tree, Card, Typography, Breadcrumb } from 'antd';
import { BookOutlined, FileTextOutlined, FolderOutlined, HomeOutlined } from '@ant-design/icons';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import LessonViewer from '../components/LessonViewer';

const { Content, Sider } = Layout;
const { Title } = Typography;

const LessonView = () => {
  const [treeData, setTreeData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);

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
      
      if (type === 'lesson') {
        if (!categories[category].children[crop].children[chapter]) {
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

  const onSelect = (keys, info) => {
    setSelectedKeys(keys);
    if (info.node.isLeaf && info.node.lessonData) {
      setCurrentLesson(info.node.lessonData);
      
      // Build breadcrumb
      const keyParts = keys[0].split('-');
      if (keyParts[0] === 'lesson') {
        const lesson = info.node.lessonData;
        setBreadcrumb([
          { title: <HomeOutlined />, href: '/' },
          { title: 'Bài học' },
          { title: lesson.category },
          { title: lesson.crop },
          { title: lesson.chapter },
          { title: lesson.title }
        ]);
      }
    } else {
      setCurrentLesson(null);
      setBreadcrumb([]);
    }
  };

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px' }}>
          <Title level={4}>Bài học nông nghiệp</Title>
          
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
          <div>
            <Breadcrumb 
              items={breadcrumb}
              style={{ marginBottom: 16 }}
            />
            <LessonViewer lesson={currentLesson} />
          </div>
        ) : (
          <Card style={{ textAlign: 'center', height: '100%' }}>
            <Title level={3} type="secondary">
              Chọn một bài học để xem nội dung
            </Title>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default LessonView;