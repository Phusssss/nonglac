import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin } from 'antd';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { mergeChunks } from '../utils/contentUtils';
import './LessonViewer.css';

const { Title } = Typography;

const LessonViewer = ({ lesson }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessonContent();
  }, [lesson.id]);

  const loadLessonContent = async () => {
    setLoading(true);
    try {
      if (lesson.isChunked) {
        const chunksQuery = query(
          collection(db, 'lesson_chunks'),
          where('lessonId', '==', lesson.id),
          orderBy('chunkIndex', 'asc')
        );
        const chunksSnapshot = await getDocs(chunksQuery);
        const chunks = chunksSnapshot.docs.map(doc => doc.data().content);
        const mergedContent = mergeChunks(chunks);
        setContent(mergedContent);
      } else {
        setContent(lesson.content || '');
      }
    } catch (error) {
      console.error('Error loading lesson content:', error);
      setContent(lesson.content || '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title level={3}>{lesson.title}</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải nội dung...</div>
        </div>
      ) : (
        <div 
          className="lesson-content"
          style={{ 
            minHeight: '400px',
            padding: '20px',
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '6px'
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </Card>
  );
};

export default LessonViewer;