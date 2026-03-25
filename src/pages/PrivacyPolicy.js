import React from 'react';
import { Layout, Typography, Card, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdvancedSEO from '../components/AdvancedSEO';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <AdvancedSEO
        title="Chính sách Bảo mật của Nông Lạc"
        description="Chính sách Bảo mật của Nông Lạc. Ngày có hiệu lực: 30/3/2026."
        keywords="chính sách bảo mật, Nông Lạc, bảo vệ dữ liệu, quyền riêng tư"
        url="/privacy-policy"
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
              Chính sách Bảo mật của Nông Lạc
            </Title>
            <Text type="secondary">Ngày có hiệu lực: 30/3/2026</Text>
          </div>

          <Divider />

          <Paragraph>
            Nông Lạc cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ thông tin của bạn.
          </Paragraph>

          <Title level={3} style={{ color: '#52c41a' }}>1. Thông tin chúng tôi thu thập</Title>
          <Paragraph>
            Chúng tôi thu thập thông tin theo các cách sau:
          </Paragraph>
          <ul>
            <li><Text strong>Thông tin bạn cung cấp trực tiếp:</Text> Tên, số điện thoại, email, địa chỉ, thông tin trang trại, hình ảnh sản phẩm, và các dữ liệu khác mà bạn nhập vào hệ thống.</li>
            <li><Text strong>Thông tin tự động:</Text> Địa chỉ IP, loại trình duyệt, hệ điều hành, thời gian truy cập, các trang bạn truy cập, và dữ liệu sử dụng khác.</li>
            <li><Text strong>Thông tin vị trí:</Text> Khi bạn sử dụng tính năng định vị (ví dụ: xác định tọa độ trang trại), chúng tôi có thể thu thập dữ liệu vị trí của bạn.</li>
            <li><Text strong>Thông tin từ bên thứ ba:</Text> Chúng tôi có thể nhận thông tin từ các đối tác hoặc dịch vụ khác mà bạn kết nối với tài khoản Nông Lạc của mình.</li>
          </ul>

          <Title level={3} style={{ color: '#52c41a' }}>2. Cách chúng tôi sử dụng thông tin của bạn</Title>
          <Paragraph>
            Chúng tôi sử dụng thông tin bạn cung cấp cho các mục đích sau:
          </Paragraph>
          <ul>
            <li>Cung cấp, duy trì và cải thiện các dịch vụ của chúng tôi.</li>
            <li>Xác thực danh tính của bạn và xác minh tài khoản.</li>
            <li>Gửi thông báo, cập nhật và thông tin hỗ trợ.</li>
            <li>Phân tích xu hướng sử dụng để cải thiện trải nghiệm người dùng.</li>
            <li>Phát triển các tính năng và dịch vụ mới.</li>
            <li>Tuân thủ các yêu cầu pháp luật và quy định.</li>
            <li>Ngăn chặn gian lận, lạm dụng và các hoạt động bất hợp pháp.</li>
          </ul>

          <Title level={3} style={{ color: '#52c41a' }}>3. Cách chúng tôi bảo vệ thông tin của bạn</Title>
          <Paragraph>
            Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ dữ liệu cá nhân của bạn:
          </Paragraph>
          <ul>
            <li><Text strong>Mã hóa:</Text> Dữ liệu nhạy cảm (như lịch sử nợ, thông tin tài chính) được mã hóa đầu cuối.</li>
            <li><Text strong>Kiểm soát truy cập:</Text> Chỉ những nhân viên được phép mới có thể truy cập dữ liệu cá nhân của bạn.</li>
            <li><Text strong>Bảo mật máy chủ:</Text> Chúng tôi sử dụng các máy chủ an toàn và tường lửa để bảo vệ dữ liệu.</li>
            <li><Text strong>Kiểm toán thường xuyên:</Text> Chúng tôi thực hiện kiểm toán bảo mật định kỳ để phát hiện và khắc phục các lỗ hổng.</li>
          </ul>

          <Title level={3} style={{ color: '#52c41a' }}>4. Chia sẻ thông tin của bạn</Title>
          <Paragraph>
            Chúng tôi <Text strong>không bán</Text> dữ liệu cá nhân của bạn cho bên thứ ba. Tuy nhiên, chúng tôi có thể chia sẻ thông tin trong các trường hợp sau:
          </Paragraph>
          <ul>
            <li><Text strong>Với sự đồng ý của bạn:</Text> Nếu bạn đồng ý, chúng tôi có thể chia sẻ thông tin với các đối tác để cung cấp dịch vụ tốt hơn.</li>
            <li><Text strong>Với các nhà cung cấp dịch vụ:</Text> Chúng tôi chia sẻ thông tin với các nhà cung cấp dịch vụ (ví dụ: lưu trữ đám mây, xử lý thanh toán) để vận hành nền tảng.</li>
            <li><Text strong>Tuân thủ pháp luật:</Text> Chúng tôi có thể tiết lộ thông tin khi được yêu cầu bởi luật pháp hoặc cơ quan chính phủ.</li>
            <li><Text strong>Bảo vệ quyền lợi:</Text> Chúng tôi có thể chia sẻ thông tin để bảo vệ quyền lợi, an toàn hoặc tài sản của Nông Lạc, người dùng hoặc công chúng.</li>
          </ul>

          <Title level={3} style={{ color: '#52c41a' }}>5. Quyền của bạn</Title>
          <Paragraph>
            Bạn có các quyền sau đây liên quan đến dữ liệu cá nhân của mình:
          </Paragraph>
          <ul>
            <li><Text strong>Quyền truy cập:</Text> Bạn có thể yêu cầu xem dữ liệu cá nhân mà chúng tôi lưu trữ về bạn.</li>
            <li><Text strong>Quyền sửa đổi:</Text> Bạn có thể yêu cầu chúng tôi sửa đổi hoặc cập nhật thông tin không chính xác.</li>
            <li><Text strong>Quyền xóa:</Text> Bạn có thể yêu cầu xóa dữ liệu cá nhân của mình, trừ khi chúng tôi cần giữ lại vì lý do pháp luật.</li>
            <li><Text strong>Quyền từ chối:</Text> Bạn có thể từ chối việc xử lý dữ liệu của mình cho các mục đích tiếp thị hoặc phân tích.</li>
            <li><Text strong>Quyền di chuyển dữ liệu:</Text> Bạn có thể yêu cầu chúng tôi cung cấp dữ liệu của bạn ở định dạng có thể di chuyển.</li>
          </ul>

          <Title level={3} style={{ color: '#52c41a' }}>6. Lưu giữ dữ liệu</Title>
          <Paragraph>
            Chúng tôi lưu giữ dữ liệu cá nhân của bạn miễn là cần thiết để cung cấp dịch vụ hoặc tuân thủ các yêu cầu pháp luật. Khi bạn xóa tài khoản, chúng tôi sẽ xóa hoặc ẩn danh dữ liệu cá nhân của bạn trong vòng 30 ngày, trừ khi pháp luật yêu cầu chúng tôi giữ lại.
          </Paragraph>

          <Title level={3} style={{ color: '#52c41a' }}>7. Cookies và công nghệ theo dõi</Title>
          <Paragraph>
            Chúng tôi sử dụng cookies và công nghệ theo dõi tương tự để:
          </Paragraph>
          <ul>
            <li>Nhớ tùy chọn của bạn.</li>
            <li>Hiểu cách bạn sử dụng nền tảng.</li>
            <li>Cải thiện trải nghiệm người dùng.</li>
            <li>Phục vụ quảng cáo được cá nhân hóa.</li>
          </ul>
          <Paragraph>
            Bạn có thể kiểm soát cookies thông qua cài đặt trình duyệt của mình. Tuy nhiên, vô hiệu hóa cookies có thể ảnh hưởng đến chức năng của nền tảng.
          </Paragraph>

          <Title level={3} style={{ color: '#52c41a' }}>8. Liên hệ với chúng tôi</Title>
          <Paragraph>
            Nếu bạn có bất kỳ câu hỏi hoặc mối quan tâm nào về chính sách bảo mật này hoặc cách chúng tôi xử lý dữ liệu của bạn, vui lòng liên hệ với chúng tôi tại:
          </Paragraph>
          <ul>
            <li><Text strong>Email:</Text> privacy@nonglac.com</li>
            <li><Text strong>Địa chỉ:</Text> Nông Lạc, Việt Nam</li>
          </ul>

          <Title level={3} style={{ color: '#52c41a' }}>9. Thay đổi chính sách này</Title>
          <Paragraph>
            Chúng tôi có thể cập nhật chính sách bảo mật này từ thời gian để phản ánh những thay đổi trong thực tiễn hoặc pháp luật. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi đáng kể nào bằng cách đăng phiên bản mới trên trang web này hoặc gửi email cho bạn.
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

export default PrivacyPolicy;
