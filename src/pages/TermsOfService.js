import React from 'react';
import { Layout, Typography, Card, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdvancedSEO from '../components/AdvancedSEO';

const { Title, Paragraph, Text } = Typography;

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <AdvancedSEO
        title="Điều khoản Dịch vụ của Nông Lạc"
        description="Điều khoản Dịch vụ của Nông Lạc. Ngày có hiệu lực: 30/3/2026."
        keywords="điều khoản dịch vụ, Nông Lạc, Agri-Trust Score, AI Lạc Lạc, Sổ Nợ Số, Chợ Nông Sản"
        url="/terms-of-service"
      />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Text
            style={{ color: '#1890ff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            Quay lại
          </Text>
        </div>

        <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ color: '#389e0d', marginBottom: 8 }}>
              Điều khoản Dịch vụ của Nông Lạc
            </Title>
            <Text type="secondary">Ngày có hiệu lực: 30/3/2026</Text>
          </div>

          <Divider />

          <Paragraph>
            Chào mừng bạn đến với Nông Lạc! Chúng tôi rất vui vì bạn đã chọn sử dụng dịch vụ của chúng tôi để số hóa niềm tin và kết nối thực tế trong nông nghiệp.
          </Paragraph>

          <Title level={3} style={{ color: '#52c41a' }}>Những gì bạn có thể mong đợi ở chúng tôi</Title>
          <Paragraph>
            Nông Lạc cung cấp một Hệ điều hành niềm tin (Trust OS) bao gồm nhiều dịch vụ khác nhau:
          </Paragraph>
          <ul>
            <li><Text strong>AI Lạc Lạc:</Text> Trợ lý trí tuệ nhân tạo hỗ trợ ra quyết định canh tác.</li>
            <li><Text strong>Sổ Nợ Số:</Text> Công cụ ghi chép công nợ minh bạch và trung lập.</li>
            <li><Text strong>Chợ Nông Sản:</Text> Nơi kết nối giao thương giữa nông dân, đại lý và doanh nghiệp.</li>
            <li><Text strong>Agri-Trust Score:</Text> Hệ thống chấm điểm uy tín dựa trên dữ liệu thực chứng.</li>
          </ul>
          <Paragraph>
            Chúng tôi cam kết không ngừng cải tiến các dịch vụ này để phục vụ cộng đồng nông nghiệp tốt hơn. Điều này có nghĩa là thỉnh thoảng chúng tôi sẽ thêm hoặc bớt các tính năng, tăng hoặc giảm giới hạn đối với dịch vụ của mình.
          </Paragraph>

          <Title level={3} style={{ color: '#52c41a' }}>Những gì chúng tôi mong đợi ở bạn</Title>
          <Paragraph>
            Mặc dù chúng tôi cấp cho bạn quyền sử dụng các dịch vụ của mình, nhưng chúng tôi vẫn giữ các quyền sở hữu trí tuệ đối với các dịch vụ đó. Đổi lại, chúng tôi mong đợi bạn tuân thủ các quy tắc ứng xử và lộ trình xây dựng niềm tin sau:
          </Paragraph>

          <Title level={4}>1. Quy trình xây dựng Agri-Trust Score (Xác thực 4 lớp)</Title>
          <Paragraph>
            Niềm tin trên Nông Lạc không đến từ lời nói, mà từ dữ liệu. Bạn có trách nhiệm vun đắp hồ sơ uy tín của mình qua các lớp xác thực:
          </Paragraph>
          <Paragraph><Text strong>Lớp 1: Dữ liệu định danh (Trọng số 20%)</Text></Paragraph>
          <ul>
            <li>Địa chỉ canh tác: Cung cấp vị trí khu vực sản xuất hoặc kho hàng.</li>
            <li>Xác minh số điện thoại: Hoàn tất xác minh số điện thoại kinh doanh hoặc định danh cá nhân (+50 điểm).</li>
          </ul>

          <Paragraph><Text strong>Lớp 2: Năng lực & Hành vi (Trọng số 40%)</Text></Paragraph>
          <ul>
            <li>Marketplace: Đăng tải sản phẩm đầu tiên để bắt đầu giao thương.</li>
            <li>Quy mô: Cung cấp diện tích canh tác (Ha) hoặc quy mô sản lượng hàng hóa (Tấn).</li>
          </ul>

          <Paragraph><Text strong>Lớp 3: Uy tín xã hội (Trọng số 40%)</Text></Paragraph>
          <ul>
            <li>Kết bạn: Nhận +5 điểm cho mỗi lượt theo dõi người khác (Tối đa 500 điểm).</li>
            <li>Tương tác: Nhận +1 điểm cho mỗi lượt thích (Like) từ cộng đồng (Tối đa 500 điểm).</li>
          </ul>

          <Paragraph><Text strong>Lớp 4: Chỉ số tương lai (Dự kiến áp dụng từ 2027)</Text></Paragraph>
          <ul>
            <li>Duy trì tỷ lệ xác nhận giao dịch thành công trên 90% (Tính từ giao dịch thứ 100).</li>
          </ul>

          <Title level={4}>2. Tuân thủ pháp luật và trách nhiệm nội dung</Title>
          <ul>
            <li>Tuân thủ: Bạn phải tuân thủ luật hiện hành, bao gồm các quy định về An ninh mạng (Nghị định 147/2024) và Bảo vệ dữ liệu cá nhân (Nghị định 13/2023).</li>
            <li>Trách nhiệm: Bạn chịu trách nhiệm về nội dung bạn đăng tải (hình ảnh nông sản, con số công nợ, bình luận). Nếu chúng tôi phát hiện nội dung vi phạm hoặc gian lận dữ liệu, chúng tôi có quyền gỡ bỏ, trừ điểm uy tín vĩnh viễn hoặc tạm dừng quyền truy cập của bạn.</li>
          </ul>

          <Title level={3} style={{ color: '#52c41a' }}>Nội dung của bạn trong các dịch vụ của Nông Lạc</Title>
          <Paragraph>
            Dữ liệu là tài sản của bạn. Tuy nhiên, khi bạn đăng tải hoặc cung cấp dữ liệu cho Nông Lạc (ví dụ: hình ảnh sâu bệnh, tọa độ trang trại), bạn cấp cho Nông Lạc một giấy phép toàn cầu để lưu trữ, sao chép và sử dụng nội dung đó cho các mục đích:
          </Paragraph>
          <ul>
            <li>Vận hành và cải thiện dịch vụ (ví dụ: huấn luyện AI Lạc Lạc nhận diện sâu bệnh tốt hơn).</li>
            <li>Phát triển các tính năng và dịch vụ mới.</li>
            <li>Đo lường các chỉ số dữ liệu vĩ mô (sau khi đã hủy định danh cá nhân).</li>
          </ul>
          <Paragraph>
            Chúng tôi không bán dữ liệu cá nhân của bạn cho bên thứ ba. Mọi việc xử lý dữ liệu nhạy cảm (như lịch sử nợ) đều được mã hóa đầu cuối và chỉ hiển thị khi có sự đồng ý của bạn.
          </Paragraph>

          <Title level={3} style={{ color: '#52c41a' }}>Trong trường hợp có vấn đề hoặc bất đồng</Title>
          <ul>
            <li>Miễn trừ trách nhiệm về tư vấn (AI Lạc Lạc): Gợi ý của AI không thay thế cho lệnh sản xuất hoặc tư vấn từ chuyên gia thực địa. Chúng tôi không chịu trách nhiệm cho những thiệt hại năng suất phát sinh từ việc áp dụng tư vấn mà không qua kiểm chứng.</li>
            <li>Tính trung lập của Sổ Nợ Số: Nông Lạc cung cấp công cụ ghi chép (SaaS), không phải bên cho vay hay thu hồi nợ. Mọi tranh chấp tài chính phải được các bên giải quyết theo pháp luật dân sự ngoài nền tảng.</li>
            <li>Chế tài vi phạm: Tùy theo mức độ, chúng tôi có thể cảnh cáo, đình chỉ tài khoản từ 30-90 ngày hoặc khóa vĩnh viễn trong trường hợp lừa đảo hoặc vi phạm an ninh quốc gia.</li>
          </ul>

          <Title level={3} style={{ color: '#52c41a' }}>Về các Điều khoản này</Title>
          <Paragraph>
            Chúng tôi có thể cập nhật các điều khoản này để phản ánh những thay đổi trong dịch vụ hoặc luật pháp. Bằng việc tiếp tục sử dụng dịch vụ sau khi các thay đổi có hiệu lực, bạn đồng ý với các điều khoản mới.
          </Paragraph>

          <Divider />
          <Paragraph strong style={{ textAlign: 'center', marginBottom: 0 }}>
            Nông Lạc - Số hóa niềm tin thị trường.
          </Paragraph>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsOfService;
