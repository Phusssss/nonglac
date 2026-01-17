import React, { useState, useRef } from 'react';
import { Card, Button, Typography, Select, Tag, Alert, Progress, Space, List } from 'antd';
import { ToolOutlined, PictureOutlined } from '@ant-design/icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { githubStorage } from '../services/githubStorage';

const { Title, Text } = Typography;
const { Option } = Select;

const PostGenerator = () => {
  const { user, userProfile } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef();

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

  const sampleTitles = {
    'Trồng trọt': [
      'Bí quyết trồng lúa năng suất 8 tấn/ha',
      'Cách trồng rau sạch không cần thuốc',
      'Kỹ thuật ghép cây ăn quả thành công 95%',
      'Mô hình luân canh tăng thu nhập gấp đôi',
      'Trồng dưa hấu trái vụ lãi 200 triệu/ha',
      'Kỹ thuật trồng hoa hồng xuất khẩu',
      'Cách chăm sóc cây ăn quả sau thu hoạch',
      'Phương pháp ủ phân hữu cơ tại nhà',
      'Trồng nấm rơm trong nhà kính',
      'Kỹ thuật trồng cà phê Arabica chất lượng cao'
    ],
    'Chăn nuôi': [
      'Nuôi gà thả vườn lãi 50 triệu/năm',
      'Chăn nuôi heo sạch VietGAP hiệu quả',
      'Kỹ thuật nuôi bò thịt cho năng suất cao',
      'Mô hình nuôi vịt thả ruộng lúa',
      'Nuôi dê sinh sản trong vùng núi',
      'Chăn nuôi thỏ thịt quy mô nhỏ',
      'Kỹ thuật nuôi ong mật hiện đại',
      'Nuôi chim cút đẻ trứng công nghiệp',
      'Mô hình nuôi ngan thả đồng',
      'Chăn nuôi cừu sinh sản hiệu quả'
    ],
    'Thủy sản': [
      'Nuôi cá tra VietGAP đạt 40 tấn/ha',
      'Kỹ thuật nuôi tôm thẻ công nghệ cao',
      'Nuôi cá lóc trong bể xi măng',
      'Mô hình nuôi ếch trong ao bạt',
      'Nuôi cá chép giòn xuất khẩu',
      'Kỹ thuật nuôi tôm càng xanh',
      'Nuôi cá rô phi đơn tính',
      'Mô hình nuôi cua biển trong ao',
      'Nuôi nghêu trong ruộng muối',
      'Kỹ thuật nuôi cá koi Nhật Bản'
    ],
    'Kỹ thuật': [
      'Ứng dụng IoT trong nông nghiệp 4.0',
      'Hệ thống tưới nhỏ giọt tự động',
      'Công nghệ nhà kính thông minh',
      'Máy bay không người lái phun thuốc',
      'Hệ thống cảnh báo sâu bệnh sớm',
      'Robot thu hoạch nông sản tự động',
      'Công nghệ blockchain trong nông nghiệp',
      'Hệ thống năng lượng mặt trời',
      'Máy phân loại nông sản AI',
      'Công nghệ bảo quản lạnh hiện đại'
    ],
    'Thị trường': [
      'Giá lúa tăng mạnh cuối năm 2024',
      'Xuất khẩu rau quả sang EU tăng 25%',
      'Thị trường cà phê biến động bất thường',
      'Nông sản hữu cơ được ưa chuộng',
      'Giá thịt heo dự báo tăng Tết 2025',
      'Thị trường tôm xuất khẩu khởi sắc',
      'Nhu cầu gạo ST25 tăng cao',
      'Giá phân bón giảm mạnh quý IV',
      'Thị trường hoa tết sôi động',
      'Xuất khẩu cá tra phục hồi tích cực'
    ],
    'Kinh nghiệm': [
      'Kinh nghiệm 20 năm trồng lúa',
      'Bí quyết chăn nuôi không dịch bệnh',
      'Cách quản lý tài chính nông hộ',
      'Kinh nghiệm khởi nghiệp nông nghiệp',
      'Bí quyết bán hàng nông sản online',
      'Cách xây dựng thương hiệu nông sản',
      'Kinh nghiệm hợp tác xã thành công',
      'Bí quyết đàm phán giá nông sản',
      'Cách quản lý nhân công hiệu quả',
      'Kinh nghiệm vay vốn ngân hàng'
    ],
    'Hỏi đáp': [
      'Cây lúa bị vàng lá phải làm sao?',
      'Gà con bị tiêu chảy cách chữa?',
      'Tôm nuôi chết hàng loạt nguyên nhân?',
      'Đất trồng rau bị chua xử lý thế nào?',
      'Cách phòng bệnh héo xanh cà chua?',
      'Heo con không ăn phải làm gì?',
      'Nước ao nuôi cá bị đục nguyên nhân?',
      'Cây ăn quả ra hoa không đậu trái?',
      'Vịt đẻ ít trứng cách khắc phục?',
      'Đất bị nhiễm mặn trồng cây gì?'
    ]
  };

  const sampleContent = {
    'Trồng trọt': [
      'Chia sẻ kinh nghiệm trồng lúa đạt năng suất cao với giống mới ST25. Từ khâu chuẩn bị đất, gieo sạ, bón phân đến thu hoạch. Đặc biệt chú ý thời điểm bón phân đúng lúc và phòng trừ sâu bệnh hiệu quả để đạt năng suất 7-8 tấn/ha.',
      'Hướng dẫn chi tiết cách trồng rau sạch tại nhà không sử dụng thuốc hóa học. Từ việc chọn giống, chuẩn bị đất, gieo trồng đến chăm sóc và thu hoạch. Sử dụng các biện pháp sinh học để phòng trừ sâu bệnh an toàn cho sức khỏe.',
      'Kỹ thuật ghép cây ăn quả với tỷ lệ thành công 95%. Thời điểm ghép tốt nhất, cách chọn cành ghép, kỹ thuật thực hiện và chăm sóc sau ghép. Áp dụng cho các loại cây như xoài, nhãn, vải, cam, chanh.',
      'Mô hình luân canh cây trồng giúp tăng thu nhập gấp đôi. Kết hợp trồng lúa - rau màu - hoa màu trong năm. Tận dụng tối đa diện tích đất và nguồn nước, giảm chi phí đầu vào.',
      'Kinh nghiệm trồng dưa hấu trái vụ cho lãi 200 triệu/ha. Kỹ thuật chọn giống, chuẩn bị đất, chăm sóc và thu hoạch. Đặc biệt chú ý đến việc tưới nước và bón phân đúng thời điểm.',
      'Hướng dẫn trồng hoa hồng xuất khẩu đạt tiêu chuẩn quốc tế. Từ chọn giống, xây dựng nhà kính, chăm sóc đến thu hoạch và bảo quản. Kỹ thuật cắt tỉa và phòng trừ sâu bệnh chuyên nghiệp.'
    ],
    'Chăn nuôi': [
      'Kinh nghiệm chăn nuôi gà thả vườn cho thu nhập 50 triệu/năm. Cách chọn giống, xây dựng chuồng trại, chế độ dinh dưỡng và phòng bệnh. Gà thả vườn cho thịt ngon, trứng chất lượng cao.',
      'Quy trình nuôi heo sạch đạt tiêu chuẩn VietGAP. Thiết kế chuồng trại, chọn giống, thức ăn, chăm sóc sức khỏe và tiêu thụ sản phẩm. Đảm bảo an toàn thực phẩm và hiệu quả kinh tế.',
      'Kỹ thuật nuôi bò thịt cho năng suất cao. Chế độ dinh dưỡng hợp lý, phòng bệnh hiệu quả và quản lý đàn bò khoa học. Tận dụng phụ phẩm nông nghiệp làm thức ăn.',
      'Mô hình nuôi vịt thả ruộng lúa sau thu hoạch. Tận dụng thóc rơi vãi và sâu bọ tự nhiên. Vịt giúp làm sạch ruộng và cung cấp phân hữu cơ cho vụ tiếp theo.',
      'Chăn nuôi dê sinh sản trong vùng núi hiệu quả. Tận dụng cỏ tự nhiên, xây dựng chuồng trại phù hợp địa hình. Chế độ chăm sóc và phòng bệnh cho đàn dê.',
      'Kỹ thuật nuôi ong mật hiện đại cho năng suất cao. Chọn địa điểm đặt tổ, quản lý đàn ong, thu hoạch mật và các sản phẩm phụ. Phòng trừ kẻ thù và bệnh tật cho ong.'
    ],
    'Thủy sản': [
      'Kỹ thuật nuôi cá tra VietGAP đạt năng suất 40 tấn/ha. Chuẩn bị ao, thả giống, quản lý chất lượng nước và thức ăn. Mật độ thả nuôi hợp lý và phòng bệnh hiệu quả.',
      'Mô hình nuôi tôm thẻ chân trắng công nghệ cao. Hệ thống biofloc, quản lý môi trường nước, thức ăn và phòng bệnh. Năng suất có thể đạt 30-40 tấn/ha/vụ.',
      'Nuôi cá lóc trong bể xi măng phù hợp diện tích nhỏ. Mật độ thả nuôi cao, quản lý chất lượng nước và thức ăn. Chu kỳ nuôi ngắn, hiệu quả kinh tế cao.',
      'Kỹ thuật nuôi ếch trong ao bạt cho hiệu quả kinh tế cao. Xây dựng ao nuôi, chọn giống, chăm sóc và thu hoạch. Thức ăn và phòng bệnh cho ếch.',
      'Nuôi cá chép giòn xuất khẩu đạt tiêu chuẩn quốc tế. Kỹ thuật ương nuôi, chăm sóc và thu hoạch. Quy trình xử lý và bảo quản sản phẩm.',
      'Mô hình nuôi tôm càng xanh trong ao đất. Chuẩn bị ao, thả giống, chăm sóc và thu hoạch. Kỹ thuật phòng trừ bệnh và quản lý chất lượng nước.'
    ],
    'Kỹ thuật': [
      'Ứng dụng IoT trong nông nghiệp 4.0 giúp tự động hóa quy trình sản xuất. Hệ thống cảm biến giám sát độ ẩm đất, nhiệt độ, ánh sáng. Tưới tiêu tự động và cảnh báo sâu bệnh sớm.',
      'Hệ thống tưới nhỏ giọt tự động tiết kiệm 50% nước. Thiết kế, lắp đặt và vận hành hệ thống. Phù hợp cho cây ăn quả, rau màu và hoa màu.',
      'Công nghệ nhà kính thông minh kiểm soát môi trường tối ưu. Hệ thống điều hòa nhiệt độ, độ ẩm, ánh sáng tự động. Tăng năng suất và chất lượng sản phẩm.',
      'Máy bay không người lái phun thuốc bảo vệ thực vật hiệu quả. Tiết kiệm thời gian, nhân công và thuốc. Phun đều, chính xác và an toàn cho người sử dụng.',
      'Hệ thống cảnh báo sâu bệnh sớm bằng AI. Phân tích hình ảnh và dữ liệu môi trường để dự báo. Giúp nông dân chủ động phòng trừ hiệu quả.',
      'Robot thu hoạch nông sản tự động giảm 70% chi phí lao động. Ứng dụng trong thu hoạch rau, củ, quả. Tăng tốc độ và đảm bảo chất lượng sản phẩm.'
    ],
    'Thị trường': [
      'Phân tích thị trường lúa gạo cuối năm 2024 cho thấy giá tăng mạnh do nhu cầu xuất khẩu cao. Dự báo xu hướng và gợi ý cho nông dân về thời điểm bán.',
      'Thị trường xuất khẩu rau quả sang EU tăng trưởng 25% nhờ chất lượng được cải thiện. Cơ hội và thách thức cho các doanh nghiệp xuất khẩu.',
      'Giá cà phê biến động bất thường do ảnh hưởng thời tiết và dịch bệnh. Phân tích nguyên nhân và dự báo xu hướng trong thời gian tới.',
      'Nông sản hữu cơ ngày càng được ưa chuộng trên thị trường. Cơ hội phát triển và yêu cầu chứng nhận cho sản phẩm hữu cơ.',
      'Dự báo giá thịt heo tăng mạnh dịp Tết 2025 do nguồn cung hạn chế. Gợi ý cho người chăn nuôi về kế hoạch sản xuất.',
      'Thị trường tôm xuất khẩu khởi sắc nhờ nhu cầu phục hồi từ các thị trường lớn. Cơ hội và thách thức cho ngành tôm Việt Nam.'
    ]
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const generatePosts = async () => {
    if (!user) {
      setError('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    if (selectedImages.length === 0) {
      setError('Vui lòng chọn ít nhất 1 ảnh');
      return;
    }

    setGenerating(true);
    setError('');
    setResults([]);

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const selectedCategory = category || categories[Math.floor(Math.random() * categories.length)];
        const categoryTitles = sampleTitles[selectedCategory] || sampleTitles['Trồng trọt'];
        const categoryContent = sampleContent[selectedCategory] || sampleContent['Trồng trọt'];
        const randomTitle = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
        const randomContent = categoryContent[Math.floor(Math.random() * categoryContent.length)];
        
        // Upload ảnh lên GitHub
        const imageUrl = await githubStorage.uploadImage(file, 'post-generator');
        
        const postData = {
          title: randomTitle,
          content: randomContent,
          category: selectedCategory,
          authorId: user.uid,
          authorName: userProfile?.displayName || user.email,
          authorAvatar: userProfile?.avatar || null,
          authorReputation: userProfile?.reputation || 0,
          images: [imageUrl],
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        };

        await addDoc(collection(db, 'posts'), postData);
        setResults(prev => [...prev, postData]);
      }
    } catch (error) {
      setError('Lỗi tạo bài viết: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card style={{ marginBottom: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space align="center">
          <ToolOutlined style={{ color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>Post Generator Tool</Title>
        </Space>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            multiple
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          <Space wrap>
            <Button
              icon={<PictureOutlined />}
              onClick={() => fileInputRef.current?.click()}
              style={{ marginBottom: 8 }}
            >
              Chọn ảnh ({selectedImages.length})
            </Button>
            
            <Select
              style={{ width: 150, marginBottom: 8 }}
              placeholder="Chọn danh mục"
              value={category}
              onChange={(value) => setCategory(value)}
              allowClear
            >
              <Option value="">Ngẫu nhiên</Option>
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Space>
          
          {selectedImages.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Sẽ tạo {selectedImages.length} bài viết từ {selectedImages.length} ảnh đã chọn
              </Text>
            </div>
          )}
        </div>

        <Button
          type="primary"
          icon={<ToolOutlined />}
          onClick={generatePosts}
          disabled={generating || !user || selectedImages.length === 0}
          loading={generating}
        >
          {generating ? 'Đang tạo...' : `Tạo ${selectedImages.length} bài viết`}
        </Button>

        {generating && (
          <div>
            <Progress percent={Math.round((results.length / selectedImages.length) * 100)} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Đang tạo bài viết... {results.length}/{selectedImages.length}
            </Text>
          </div>
        )}

        {error && (
          <Alert 
            message={error}
            type="error"
          />
        )}

        {results.length > 0 && (
          <div>
            <Text strong>
              Đã tạo {results.length} bài viết:
            </Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {results.map((post, index) => (
                  <Tag 
                    key={index}
                    color="success"
                  >
                    {post.category} - {post.title.substring(0, 30)}...
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        )}

        <Card 
          size="small" 
          style={{ backgroundColor: '#fafafa' }}
          title="Tính năng:"
        >
          <List
            size="small"
            dataSource={[
              'Chọn ảnh từ bộ nhớ để tạo bài viết',
              'Mỗi ảnh sẽ tạo 1 bài viết riêng biệt',
              'Nội dung ngẫu nhiên theo danh mục',
              'Upload ảnh lên GitHub tự động',
              'Random likes, comments và thời gian'
            ]}
            renderItem={item => (
              <List.Item>
                <Text>• {item}</Text>
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </Card>
  );
};

export default PostGenerator;