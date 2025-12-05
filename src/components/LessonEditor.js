import React, { useState, useRef } from 'react';
import { Card, Button, Input, Space, Table, Modal, Typography, notification } from 'antd';
import { SaveOutlined, PictureOutlined, TableOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, updateDoc, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { compressHTML, splitContent, mergeChunks, processImagesInContent } from '../utils/contentUtils';
import './LessonViewer.css';

const { Title } = Typography;

const LessonEditor = ({ lesson, onSave }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState(lesson.title || '');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tableModalVisible, setTableModalVisible] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const quillRef = useRef();

  React.useEffect(() => {
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

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'image', 'video'
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const processedContent = await processImagesInContent(content);
      const chunks = splitContent(processedContent);
      
      if (chunks.length === 1) {
        const lessonRef = doc(db, 'lessons', lesson.id);
        await updateDoc(lessonRef, {
          title,
          content: chunks[0],
          updatedAt: new Date(),
          isChunked: false
        });
      } else {
        for (let i = 0; i < chunks.length; i++) {
          await addDoc(collection(db, 'lesson_chunks'), {
            lessonId: lesson.id,
            chunkIndex: i,
            content: chunks[i],
            createdAt: new Date()
          });
        }
        
        const lessonRef = doc(db, 'lessons', lesson.id);
        await updateDoc(lessonRef, {
          title,
          content: `[CHUNKED_CONTENT_${chunks.length}_CHUNKS]`,
          updatedAt: new Date(),
          isChunked: true,
          totalChunks: chunks.length
        });
      }
      
      notification.success({ message: 'Đã lưu bài học!' });
      onSave?.();
    } catch (error) {
      console.error('Error saving lesson:', error);
      notification.error({ message: 'Lỗi khi lưu bài học!' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          quill.insertEmbed(range.index, 'image', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
  };

  const insertTable = () => {
    setTableModalVisible(true);
    const sampleData = [
      { key: '1', col1: 'Ô 1,1', col2: 'Ô 1,2', col3: 'Ô 1,3' },
      { key: '2', col1: 'Ô 2,1', col2: 'Ô 2,2', col3: 'Ô 2,3' },
      { key: '3', col1: 'Ô 3,1', col2: 'Ô 3,2', col3: 'Ô 3,3' }
    ];
    
    const sampleColumns = [
      { title: 'Cột 1', dataIndex: 'col1', key: 'col1' },
      { title: 'Cột 2', dataIndex: 'col2', key: 'col2' },
      { title: 'Cột 3', dataIndex: 'col3', key: 'col3' }
    ];
    
    setTableData(sampleData);
    setTableColumns(sampleColumns);
  };

  const handleTableInsert = () => {
    let tableHtml = '<table border="1" style="border-collapse: collapse; width: 100%;">';
    
    tableHtml += '<thead><tr>';
    tableColumns.forEach(col => {
      tableHtml += `<th style="padding: 8px; background: #f0f0f0;">${col.title}</th>`;
    });
    tableHtml += '</tr></thead>';
    
    tableHtml += '<tbody>';
    tableData.forEach(row => {
      tableHtml += '<tr>';
      tableColumns.forEach(col => {
        tableHtml += `<td style="padding: 8px;">${row[col.dataIndex] || ''}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table><br>';

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(range.index, tableHtml);
    
    setTableModalVisible(false);
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={4}>Chỉnh sửa bài học</Title>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài học"
            style={{ fontSize: '18px', fontWeight: 'bold' }}
          />
        </div>

        <div>
          <Space style={{ marginBottom: 16 }}>
            <Button icon={<PictureOutlined />} onClick={handleImageUpload}>
              Chèn hình ảnh
            </Button>
            <Button icon={<TableOutlined />} onClick={insertTable}>
              Chèn bảng
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              Lưu bài học
            </Button>
          </Space>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>
              Đang tải nội dung...
            </div>
          ) : (
            <div className="lesson-content">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                style={{ 
                  minHeight: '400px',
                  background: 'white'
                }}
                placeholder="Viết nội dung bài học tại đây..."
              />
            </div>
          )}
        </div>
      </Space>

      <Modal
        title="Chèn bảng"
        open={tableModalVisible}
        onOk={handleTableInsert}
        onCancel={() => setTableModalVisible(false)}
        width={800}
      >
        <Table
          dataSource={tableData}
          columns={tableColumns.map(col => ({
            ...col,
            render: (text, record, index) => (
              <Input
                value={text}
                onChange={(e) => {
                  const newData = [...tableData];
                  newData[index][col.dataIndex] = e.target.value;
                  setTableData(newData);
                }}
              />
            )
          }))}
          pagination={false}
          bordered
        />
        <Space style={{ marginTop: 16 }}>
          <Button onClick={() => {
            const newRow = { key: Date.now().toString() };
            tableColumns.forEach(col => {
              newRow[col.dataIndex] = '';
            });
            setTableData([...tableData, newRow]);
          }}>
            Thêm hàng
          </Button>
          <Button onClick={() => {
            const newCol = {
              title: `Cột ${tableColumns.length + 1}`,
              dataIndex: `col${tableColumns.length + 1}`,
              key: `col${tableColumns.length + 1}`
            };
            setTableColumns([...tableColumns, newCol]);
            const newData = tableData.map(row => ({
              ...row,
              [newCol.dataIndex]: ''
            }));
            setTableData(newData);
          }}>
            Thêm cột
          </Button>
        </Space>
      </Modal>
    </Card>
  );
};

export default LessonEditor;