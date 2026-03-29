import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Table, Tag, message, Space, Typography, Badge, Modal, App } from 'antd';
import { Database, RefreshCw, Send, CheckCircle, AlertCircle, FileVideo, ExternalLink, Play, Loader2 } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, serverTimestamp, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import OptimizedVideoPlayer from '../../../components/OptimizedVideoPlayer';

const { Text, Title, Link } = Typography;

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1EFIMYfhmIcfZvOZpKjOfrdKK6lnAGvCX/export?format=csv&gid=1164454597';

const convertDriveUrl = (url) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    // Sử dụng link trực tiếp cho video tag
    return `https://drive.google.com/uc?id=${match[1]}`;
  }
  return url;
};

const AdminAutoPostVideo = () => {
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState({ new: 0, existing: 0 });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(null);

  const fetchSpreadsheet = async () => {
    setLoading(true);
    try {
      // Thêm proxy hoặc fetch trực tiếp tùy thuộc vào CORS
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error('Không thể tải dữ liệu từ Spreadsheet');
      
      const text = await response.text();
      const rawLines = text.split('\n');
      
      const parsedVideos = [];
      rawLines.forEach(line => {
        // Handle CSV split with potential commas inside quotes (basic version)
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length >= 3) {
          const idStr = parts[0].trim().replace(/"/g, '');
          const date = parts[1].trim().replace(/"/g, '');
          const url = parts[2].trim().replace(/"/g, '');
          const customTitle = parts[3]?.trim().replace(/"/g, '');
          const customContent = parts[4]?.trim().replace(/"/g, '');
          
          if (url.includes('drive.google.com')) {
            parsedVideos.push({
              key: `${date}-${url}`,
              id: idStr,
              date,
              originalUrl: url,
              convertedUrl: convertDriveUrl(url),
              title: customTitle || `Tin tức Nông Lạc - ${date}`,
              content: customContent || `Cập nhật tin tức nông nghiệp ngày ${date}`
            });
          }
        }
      });

      if (parsedVideos.length === 0) {
        message.warning('Không tìm thấy link video nào trong spreadsheet.');
        setVideos([]);
        return;
      }

      // Kiểm tra xem đã tồn tại trong Firestore chưa (Dựa trên driveId hoặc URL)
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('isAdminPost', '==', true));
      const snapshot = await getDocs(q);
      
      const existingDriveIds = new Set();
      const existingUrls = new Set();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.driveId) existingDriveIds.add(data.driveId);
        if (data.media) {
          data.media.forEach(m => {
            if (m.url) existingUrls.add(m.url);
          });
        }
      });

      const processedVideos = parsedVideos.map(v => {
        const driveId = v.originalUrl.match(/[?&]id=([^&]+)/)?.[1] || v.originalUrl.match(/\/d\/([^/]+)/)?.[1];
        return {
          ...v,
          exists: (driveId && existingDriveIds.has(driveId)) || existingUrls.has(v.convertedUrl)
        };
      });

      setVideos(processedVideos);
      setStats({
        new: processedVideos.filter(v => !v.exists).length,
        existing: processedVideos.filter(v => v.exists).length
      });
      message.success(`Đã tải ${processedVideos.length} video từ spreadsheet.`);
    } catch (error) {
      console.error('Error fetching spreadsheet:', error);
      message.error(`Lỗi: ${error.message}. Thử copy link export CSV trực tiếp.`);
    } finally {
      setLoading(false);
    }
  };

  const { message: antMessage } = App.useApp();

  const postVideo = async (video) => {
    try {
      const loadingKey = `posting-${video.key}`;
      antMessage.loading({ content: `Đang gửi lệnh đăng video: ${video.date}...`, key: loadingKey });
      
      const driveId = video.originalUrl.match(/[?&]id=([^&]+)/)?.[1] || video.originalUrl.match(/\/d\/([^/]+)/)?.[1];
      if (!driveId) throw new Error('Không thể lấy ID video từ link Drive');
      
      // Tạo request trong Firestore
      const requestRef = await addDoc(collection(db, 'post_requests'), {
        type: 'single',
        driveId,
        date: video.date,
        title: video.title,
        content: video.content,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Lắng nghe kết quả
      return new Promise((resolve) => {
        const unsubscribe = onSnapshot(doc(db, 'post_requests', requestRef.id), (snap) => {
          const data = snap.data();
          if (data.status === 'completed') {
            unsubscribe();
            antMessage.success({ content: `Đã đăng video ngày ${video.date} thành công!`, key: loadingKey });
            setVideos(prev => prev.map(v => v.key === video.key ? { ...v, exists: true } : v));
            setStats(prev => ({ ...prev, new: Math.max(0, prev.new - 1), existing: prev.existing + 1 }));
            resolve(true);
          } else if (data.status === 'failed') {
            unsubscribe();
            antMessage.error({ content: `Lỗi: ${data.error || 'Server không thể xử lý video'}`, key: loadingKey });
            resolve(false);
          }
        });

        // Timeout sau 5 phút
        setTimeout(() => {
          unsubscribe();
          antMessage.error({ content: 'Yêu cầu quá hạn. Vui lòng thử lại.', key: loadingKey });
          resolve(false);
        }, 300000);
      });
    } catch (error) {
      console.error('Error posting video:', error);
      antMessage.error({ content: `Lỗi: ${error.message}` });
      return false;
    }
  };

  const handleSyncAll = async () => {
    const newVideos = videos.filter(v => !v.exists);
    if (newVideos.length === 0) {
      antMessage.info('Không có video mới để đăng.');
      return;
    }

    setSyncing(true);
    const loadingKey = 'sync-all';
    antMessage.loading({ content: 'Đang gửi yêu cầu đồng bộ toàn bộ video...', key: loadingKey });

    try {
      const requestRef = await addDoc(collection(db, 'post_requests'), {
        type: 'sync_all',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      onSnapshot(doc(db, 'post_requests', requestRef.id), (snap) => {
        const data = snap.data();
        if (data.status === 'completed') {
          antMessage.success({ content: `Đã đồng bộ xong ${data.result?.count || 0} bài viết mới!`, key: loadingKey });
          setSyncing(false);
          fetchSpreadsheet(); // Tải lại để cập nhật trạng thái
        } else if (data.status === 'failed') {
          antMessage.error({ content: `Lỗi đồng bộ: ${data.error}`, key: loadingKey });
          setSyncing(false);
        }
      });
    } catch (error) {
      antMessage.error({ content: `Lỗi: ${error.message}`, key: loadingKey });
      setSyncing(false);
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: 'Video Link',
      dataIndex: 'originalUrl',
      key: 'url',
      render: (url) => (
        <Space>
          <Text ellipsis style={{ maxWidth: 200 }}>{url}</Text>
          <Link href={url} target="_blank"><ExternalLink size={14} /></Link>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => (
        record.exists ? 
          <Tag color="success" icon={<CheckCircle size={12} className="inline mr-1" />}>Đã đăng</Tag> : 
          <Tag color="processing" icon={<AlertCircle size={12} className="inline mr-1" />}>Chưa đăng</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            size="small"
            icon={<Play size={14} />}
            onClick={() => {
              setCurrentPreview(record);
              setPreviewVisible(true);
            }}
          >
            Xem thử
          </Button>
          <Button 
            type="primary" 
            size="small" 
            disabled={record.exists}
            onClick={() => postVideo(record)}
            icon={<Send size={14} />}
          >
            Đăng bài
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card 
      title={
        <Space>
          <Database className="text-agri-600" />
          <span>Tự động đăng Video từ Google Sheets</span>
        </Space>
      }
      variant="borderless"
      className="mb-6 shadow-sm rounded-2xl bg-agri-50/30"
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Link xuất CSV của Google Spreadsheet" 
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className="rounded-xl h-10"
          />
          <Button 
            type="primary" 
            onClick={fetchSpreadsheet} 
            loading={loading}
            icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
            className="bg-agri-600 border-none h-10 rounded-xl px-6 flex items-center gap-2"
          >
            Quét Sheet
          </Button>
        </div>

        {videos.length > 0 && (
          <>
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-agri-100">
              <Space size="large">
                <Badge count={videos.length} showZero color="#52c41a" title="Tổng số video">
                  <div className="px-3 py-1 bg-gray-50 rounded-lg">Tổng video</div>
                </Badge>
                <Badge count={stats.new} showZero color="#1890ff" title="Video mới">
                  <div className="px-3 py-1 bg-gray-50 rounded-lg">Chưa đăng</div>
                </Badge>
                <Badge count={stats.existing} showZero color="#999" title="Video đã tồn tại">
                  <div className="px-3 py-1 bg-gray-50 rounded-lg">Đã đăng</div>
                </Badge>
              </Space>
              
              <Button 
                type="primary" 
                danger={stats.new > 0}
                disabled={stats.new === 0 || syncing}
                onClick={handleSyncAll}
                loading={syncing}
                icon={<FileVideo size={18} />}
                className={`${stats.new > 0 ? 'bg-blue-600' : 'bg-gray-400'} border-none h-10 rounded-xl px-8 font-bold flex items-center gap-2`}
              >
                {syncing ? 'Đang đồng bộ...' : `Đăng tất cả bài mới (${stats.new})`}
              </Button>
            </div>

            <Table 
              columns={columns} 
              dataSource={videos} 
              pagination={{ pageSize: 5 }}
              size="small"
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-agri-100"
            />
          </>
        )}
      </div>

      <Modal
        title={`Xem trước video: ${currentPreview?.date}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={400}
        centered
        styles={{ body: { padding: 0, overflow: 'hidden', borderRadius: '0 0 12px 12px' } }}
      >
        {currentPreview && (
          <div className="aspect-[9/16] bg-black">
            <OptimizedVideoPlayer 
              src={currentPreview.convertedUrl}
              autoPlay={true}
              controls={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
        <div className="p-4 bg-white">
          <Text type="secondary" size="small">
            Lưu ý: Nếu video không hiển thị, hãy đảm bảo file trên Drive được chia sẻ ở chế độ "Bất kỳ ai có liên kết đều có thể xem".
          </Text>
        </div>
      </Modal>
    </Card>
  );
};

export default AdminAutoPostVideo;
