import React from 'react';
import { Layout, Typography, Card, Divider, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdvancedSEO from '../components/AdvancedSEO';

const { Title, Paragraph, Text } = Typography;

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <AdvancedSEO 
        title="Điều khoản sử dụng và Cam kết bảo mật - NôngLạc"
        description="Điều khoản sử dụng và cam kết bảo mật của NôngLạc - Hệ điều hành Niềm tin Nông nghiệp. Phiên bản Beta hiệu lực từ 22/12/2025."
        keywords="điều khoản sử dụng, bảo mật, nông lạc, nông nghiệp, beta"
        url="/terms-of-service"
      />
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
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
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={2} style={{ color: '#52c41a', marginBottom: 8 }}>
              ĐIỀU KHOẢN SỬ DỤNG VÀ CAM KẾT BẢO MẬT
            </Title>
            <Text strong style={{ color: '#fa8c16' }}>(PHIÊN BẢN BETA)</Text>
            <br />
            <Text type="secondary">Ngày hiệu lực: 22/12/2025</Text>
            <br />
            <Text type="secondary">Đơn vị vận hành: Dự án Nông Lạc - Đại học Yersin Đà Lạt</Text>
          </div>

          <Divider />

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ color: '#52c41a' }}>LỜI NGỎ TỪ ĐỘI NGŨ NÔNG LẠC</Title>
              <Paragraph>
                <Text strong>Kính chào bà con nông dân và quý đối tác,</Text>
              </Paragraph>
              <Paragraph>
                Cảm ơn quý vị đã tin tưởng trở thành những người đầu tiên trải nghiệm <Text strong style={{ color: '#52c41a' }}>Nông Lạc - Hệ điều hành Niềm tin Nông nghiệp</Text>.
              </Paragraph>
              <Paragraph>
                Hiện tại, ứng dụng đang trong giai đoạn <Text strong style={{ color: '#fa8c16' }}>THỬ NGHIỆM (BETA)</Text>. Mục tiêu của giai đoạn này là lắng nghe ý kiến của bà con để hoàn thiện sản phẩm.
              </Paragraph>
              <Paragraph>
                Bằng việc đăng ký (tick vào ô "Tôi đồng ý") và sử dụng Nông Lạc, quý vị xác nhận đã đọc, hiểu và chấp thuận các điều khoản dưới đây:
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={3} style={{ color: '#ff4d4f' }}>PHẦN I: TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM (GIAI ĐOẠN BETA)</Title>
              
              <Title level={4}>1. Tính ổn định của hệ thống:</Title>
              <Paragraph>
                Do đang trong giai đoạn Beta, ứng dụng có thể gặp lỗi kỹ thuật nhỏ. Chúng tôi cam kết khắc phục nhanh nhất có thể nhưng không chịu trách nhiệm cho các gián đoạn bất khả kháng.
              </Paragraph>

              <Title level={4}>2. Dữ liệu thử nghiệm:</Title>
              <Paragraph>
                Chúng tôi có quyền đặt lại (reset) một số dữ liệu điểm thưởng trong quá trình nâng cấp. Tuy nhiên, các dữ liệu sau được <Text strong style={{ color: '#52c41a' }}>BẢO LƯU TUYỆT ĐỐI</Text>:
              </Paragraph>
              <ul>
                <li><Text strong>Sổ Nợ Số</Text> (Các khoản nợ đã xác nhận).</li>
                <li><Text strong>Thông tin định danh</Text> (Tên, Số điện thoại, Vườn).</li>
              </ul>

              <Title level={4}>3. Giá trị tham chiếu:</Title>
              <Paragraph>
                Tính năng "Giá Tham Chiếu" và "Bác Sĩ Cây Trồng (AI)" chỉ mang tính chất hỗ trợ tư vấn.
                Giá cả thực tế phụ thuộc vào thương lượng giữa người mua và người bán.
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={3} style={{ color: '#1890ff' }}>PHẦN II: QUYỀN VÀ TRÁCH NHIỆM NGƯỜI DÙNG</Title>
              
              <Title level={4}>1. Tính trung thực (Cốt lõi của Nông Lạc):</Title>
              <Paragraph>
                <Text strong style={{ color: '#52c41a' }}>Nông Lạc hoạt động dựa trên Niềm tin</Text>. Quý vị cam kết:
              </Paragraph>
              <ul>
                <li><Text strong>Không báo giá ảo:</Text> Không cố tình nhập giá sai lệch.</li>
                <li><Text strong>Không tạo nick ảo:</Text> Mỗi người chỉ sử dụng 01 tài khoản chính chủ.</li>
                <li><Text strong>Không spam:</Text> Không đăng tải nội dung rác hoặc sai sự thật.</li>
              </ul>

              <Title level={4}>2. Sử dụng "Sổ Nợ Số":</Title>
              <Paragraph>
                Việc bấm "Xác nhận nợ" trên ứng dụng có giá trị như một sự thừa nhận nợ điện tử.
                Nông Lạc không đóng vai trò là tòa án hay đơn vị thu hồi nợ. Tranh chấp tài chính được giải quyết theo luật dân sự.
              </Paragraph>

              <Title level={4}>3. Cơ chế Điểm Tín Nhiệm (Agri-Trust Score):</Title>
              <Paragraph>
                Hành động thanh toán (đúng hạn/trễ hạn) và thực hiện hợp đồng (giữ cọc/bẻ cọc) sẽ ảnh hưởng trực tiếp đến điểm uy tín và khả năng vay vốn sau này.
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={3} style={{ color: '#722ed1' }}>PHẦN III: CAM KẾT BẢO MẬT & SỬ DỤNG DỮ LIỆU (TUÂN THỦ NGHỊ ĐỊNH 13)</Title>
              
              <Title level={4}>1. Cơ chế Đồng thuận (Consent) cho Mobile ID:</Title>
              <Paragraph>
                Khi chọn "Đăng nhập bằng Mobile ID", quý vị đồng ý cho phép Nông Lạc xử lý các dữ liệu sau từ nhà mạng viễn thông:
              </Paragraph>
              <ul>
                <li>Số điện thoại chính chủ.</li>
                <li>Thời gian kích hoạt thuê bao.</li>
                <li>Vị trí địa lý gần đúng (để xác thực vùng trồng).</li>
              </ul>

              <Title level={4}>2. Mục đích xử lý dữ liệu:</Title>
              <Paragraph>
                Chúng tôi cam kết sử dụng dữ liệu CHỈ cho các mục đích:
              </Paragraph>
              <ul>
                <li><Text strong>Chấm điểm tín dụng (Credit Scoring):</Text> Tổng hợp Agri-Trust Score để hỗ trợ vay vốn ngân hàng hoặc mua vật tư trả chậm.</li>
                <li><Text strong>Kết nối thị trường:</Text> Gợi ý thương lái/người mua phù hợp để tối ưu chi phí vận chuyển.</li>
              </ul>

              <Title level={4}>3. Chia sẻ dữ liệu:</Title>
              <Paragraph>
                Nông Lạc <Text strong style={{ color: '#ff4d4f' }}>TUYỆT ĐỐI KHÔNG</Text> bán dữ liệu cho bên thứ ba trái phép (quảng cáo rác, bất động sản...). 
                Dữ liệu chỉ được chuyển giao cho Ngân hàng/Tổ chức tài chính khi quý vị chủ động thực hiện yêu cầu vay vốn.
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={3} style={{ color: '#fa541c' }}>PHẦN IV: QUYỀN CỦA CHỦ THỂ DỮ LIỆU (QUAN TRỌNG)</Title>
              <Paragraph>
                Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, quý vị có các quyền sau:
              </Paragraph>

              <Title level={4}>1. Quyền được biết và đồng ý:</Title>
              <Paragraph>
                Quý vị được thông báo rõ ràng về loại dữ liệu được thu thập và mục đích sử dụng (như đã nêu ở Phần III).
              </Paragraph>

              <Title level={4}>2. Quyền truy cập và chỉnh sửa:</Title>
              <Paragraph>
                Quý vị có quyền xem và yêu cầu chỉnh sửa thông tin cá nhân của mình trên Ứng dụng bất cứ lúc nào 
                (trừ các dữ liệu lịch sử giao dịch nợ đã chốt - để đảm bảo tính minh bạch tài chính).
              </Paragraph>

              <Title level={4}>3. Quyền rút lại sự đồng ý và xóa dữ liệu:</Title>
              <Paragraph>
                Quý vị có quyền yêu cầu xóa tài khoản và dữ liệu cá nhân khỏi hệ thống Nông Lạc.
              </Paragraph>
              <Paragraph>
                <Text strong style={{ color: '#fa8c16' }}>Lưu ý quan trọng:</Text> Yêu cầu xóa dữ liệu chỉ được chấp thuận khi quý vị đã hoàn tất mọi nghĩa vụ tài chính 
                (không còn khoản nợ treo trên Sổ Nợ Số). Dữ liệu liên quan đến giao dịch tín dụng có thể được lưu trữ bắt buộc theo quy định của Luật Các tổ chức tín dụng.
              </Paragraph>

              <Title level={4}>4. Cách thức thực hiện quyền:</Title>
              <Paragraph>
                Để yêu cầu trích xuất hoặc xóa dữ liệu, vui lòng gửi email về: <Text code>administration@nonglac.com</Text> hoặc sử dụng tính năng "Yêu cầu hỗ trợ" trong App.
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={3} style={{ color: '#fa541c' }}>PHẦN V: CƠ CHẾ XỬ LÝ VI PHẠM</Title>
              <Paragraph>
                Để bảo vệ cộng đồng, Nông Lạc sẽ áp dụng các biện pháp:
              </Paragraph>
              <ul>
                <li><Text strong>Cảnh cáo:</Text> Vi phạm lần đầu.</li>
                <li><Text strong>Trừ điểm uy tín:</Text> Ảnh hưởng khả năng vay vốn.</li>
                <li><Text strong>Khóa tài khoản vĩnh viễn:</Text> Nếu lừa đảo hoặc phá hoại hệ thống.</li>
              </ul>
            </div>

            <Divider />

            <div style={{ 
              background: 'linear-gradient(135deg, #f6ffed, #d9f7be)', 
              padding: 24, 
              borderRadius: 12,
              textAlign: 'center'
            }}>
              <Paragraph strong style={{ fontSize: 16, marginBottom: 16 }}>
                Bằng việc nhấn vào nút "TÔI ĐỒNG Ý" hoặc tiếp tục sử dụng ứng dụng, 
                quý vị xác nhận đã hiểu rõ các quyền lợi và trách nhiệm nêu trên.
              </Paragraph>
              <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                Hotline Hỗ trợ: [Số điện thoại Admin Bích]
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsOfService;