import React, { useState } from 'react';
import {
  ShieldCheck,
  Bot,
  BookOpen,
  Truck,
  Users,
  LineChart,
  Bird,
  Globe,
  Sprout,
  User,
  Code,
  PenTool,
  Database,
  X,
  Info
} from 'lucide-react';
import AdvancedSEO from '../components/AdvancedSEO';

const AboutUs = () => {
  const [modal, setModal] = useState({ open: false, title: '', message: '' });

  const showModal = (title, message) => setModal({ open: true, title, message });
  const closeModal = () => setModal({ open: false, title: '', message: '' });

  return (
    <div className="bg-[#F8F9FA] text-[#2D3748]">
      <AdvancedSEO
        title="Nông Lạc - Kết nối nông sản, Kiến tạo mùa vàng"
        description="Minh bạch hóa chuỗi cung ứng, biến uy tín và mồ hôi của người nông dân thành tài sản số thiết thực."
        keywords="Nông Lạc, nông nghiệp, nông sản, Agri-Trust Score, AI cây trồng, Zalo Mini App"
        url="/about-us"
      />

      <section className="relative overflow-hidden bg-[#3A9947]">
        <div className="absolute inset-0 z-10 bg-black/40" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#3A9947] to-[#1CBECF] opacity-80" />

        <div className="relative z-20 mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
          <span className="mb-4 text-sm font-bold uppercase tracking-wider text-[#EDB324] sm:text-base">
            Hệ điều hành niềm tin Nông nghiệp
          </span>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Kết nối nông sản <br /> Kiến tạo mùa vàng
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#F8F9FA] sm:text-xl">
            Minh bạch hóa chuỗi cung ứng, biến uy tín và mồ hôi của người nông dân thành tài sản số thiết thực.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="#giai-phap"
              className="rounded-full bg-[#EDB324] px-8 py-3.5 text-lg font-bold text-[#2D3748] shadow-lg transition hover:bg-yellow-500"
            >
              Khám phá giải pháp
            </a>
          </div>
        </div>
      </section>

      <section id="cau-chuyen" className="bg-[#F8F9FA] py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-[#3A9947] sm:text-4xl">Lời giải từ niềm tin</h2>
          <div className="space-y-6 text-left text-lg leading-relaxed text-gray-700 sm:text-justify">
            <p>
              Nông nghiệp Việt Nam vươn ra thế giới với những con số xuất khẩu đáng tự hào. Nhưng đằng sau ánh hào quang
              vĩ mô ấy, bà con nông dân vẫn trăn trở với điệp khúc "được mùa rớt giá" và những chuyến xe chạy rỗng chiều
              về. Tỷ lệ thất thoát sau thu hoạch và chi phí vận tải vẫn chiếm một phần quá lớn trong công sức gieo trồng.
            </p>
            <p>
              Căn nguyên không nằm ở kỹ thuật canh tác, mà ở{' '}
              <strong className="text-[#2D3748]">Sự đứt gãy niềm tin thị trường (Information Asymmetry)</strong>. Sự thiếu
              minh bạch khiến nông sản chất lượng bị cào bằng. Người trồng thiếu thông tin giá cả, người mua thấp thỏm nỗi
              lo bẻ cọc. Một thị trường khuyết thiếu niềm tin là một bài toán không có người thắng.
            </p>
            <p>
              Từ những ngày bám đất tại "thủ phủ" Vạn Thành - Lâm Đồng, <strong className="text-[#3A9947]">Nông Lạc</strong>{' '}
              ra đời. Chúng tôi không vẽ thêm một phần mềm quản lý phức tạp. Chúng tôi kiến tạo một{' '}
              <strong>Hệ điều hành Niềm tin (Trust Operating System)</strong> đi từ dưới lên, lấy người nông dân làm gốc rễ.
            </p>
          </div>
        </div>
      </section>

      <section id="giai-phap" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#3A9947] sm:text-4xl">Các Trụ Cột Giải Pháp</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Tích hợp trực tiếp trên Zalo Mini App, phá bỏ mọi rào cản công nghệ, mang trải nghiệm mượt mà đến tận tay bà
              con.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-[#F8F9FA] p-8 shadow-sm transition hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#3A9947]/10">
                <ShieldCheck className="h-8 w-8 text-[#3A9947]" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Agri-Trust Score</h3>
              <p className="mb-6 flex-grow text-gray-600">
                Điểm tín nhiệm nông nghiệp. Số hóa lịch sử canh tác, tính minh bạch và sự tuân thủ cam kết thành "giấy
                thông hành" để vay vốn và mua vật tư trả chậm.
              </p>
              <button
                onClick={() =>
                  showModal(
                    'Agri-Trust Score',
                    'Hệ thống đang trích xuất dữ liệu tín nhiệm mẫu. Chức năng đánh giá hồ sơ sẽ hiển thị tại đây.'
                  )
                }
                className="w-full rounded-lg border-2 border-[#3A9947] py-3 font-semibold text-[#3A9947] transition hover:bg-[#3A9947] hover:text-white"
              >
                Trải nghiệm tính năng
              </button>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-[#F8F9FA] p-8 shadow-sm transition hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#1CBECF]/10">
                <Bot className="h-8 w-8 text-[#1CBECF]" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Trợ lý AI Lạc Lạc</h3>
              <p className="mb-6 flex-grow text-gray-600">
                Bác sĩ cây trồng tại gia. Chỉ cần một bức ảnh, AI sẽ chẩn đoán bệnh và đưa ra phác đồ điều trị chuẩn xác dựa
                trên dữ liệu Khuyến nông Quốc gia.
              </p>
              <button
                onClick={() =>
                  showModal('Trợ lý AI Lạc Lạc', 'Vui lòng cho phép truy cập Camera để tải ảnh lá cây lên hệ thống chẩn đoán.')
                }
                className="w-full rounded-lg border-2 border-[#3A9947] py-3 font-semibold text-[#3A9947] transition hover:bg-[#3A9947] hover:text-white"
              >
                Trải nghiệm tính năng
              </button>
            </div>

            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-[#F8F9FA] p-8 shadow-sm transition hover:shadow-md">
              <div className="absolute right-4 top-4 rounded-full bg-[#EDB324] px-3 py-1 text-xs font-bold text-white shadow-sm">
                Đang phát triển
              </div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200">
                <BookOpen className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Sổ Nợ Số</h3>
              <p className="mb-6 flex-grow text-gray-600">
                Thay thế sổ tay vật lý. Minh bạch hóa công nợ, nhắc nợ tinh tế qua Zalo, đảm bảo đối soát rõ ràng và chấm dứt
                rủi ro tranh chấp.
              </p>
              <button
                onClick={() =>
                  showModal('Sổ Nợ Số', 'Tính năng đang trong giai đoạn hoàn thiện nội bộ (Beta). Sẽ sớm ra mắt để phục vụ bà con!')
                }
                className="w-full cursor-pointer rounded-lg bg-gray-200 py-3 font-semibold text-gray-500 transition hover:bg-gray-300"
              >
                Trải nghiệm tính năng
              </button>
            </div>

            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-[#F8F9FA] p-8 shadow-sm transition hover:shadow-md">
              <div className="absolute right-4 top-4 rounded-full bg-[#EDB324] px-3 py-1 text-xs font-bold text-white shadow-sm">
                Đang phát triển
              </div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200">
                <Truck className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Ghép Chuyến Thông Minh</h3>
              <p className="mb-6 flex-grow text-gray-600">
                Tối ưu hóa các chuyến xe chạy rỗng chiều về bằng thuật toán Logistics. Cắt giảm chi phí vận tải, gia tăng giá
                trị lợi nhuận cho chuỗi cung ứng.
              </p>
              <button
                onClick={() =>
                  showModal(
                    'Ghép Chuyến Thông Minh',
                    'Thuật toán Logistics đang được huấn luyện (Training) với dữ liệu thực tế tại Đà Lạt. Vui lòng quay lại sau!'
                  )
                }
                className="w-full cursor-pointer rounded-lg bg-gray-200 py-3 font-semibold text-gray-500 transition hover:bg-gray-300"
              >
                Trải nghiệm tính năng
              </button>
            </div>

            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-[#F8F9FA] p-8 shadow-sm transition hover:shadow-md">
              <div className="absolute right-4 top-4 rounded-full bg-[#EDB324] px-3 py-1 text-xs font-bold text-white shadow-sm">
                Đang phát triển
              </div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Mạng xã hội & Chợ nông sản</h3>
              <p className="mb-6 flex-grow text-gray-600">
                Không gian để bà con giao lưu kinh nghiệm đồng áng và kết nối giao thương trực tiếp, giữ lại vẹn nguyên giá
                trị nông sản mà không qua trung gian.
              </p>
              <button
                onClick={() =>
                  showModal(
                    'Mạng xã hội & Chợ',
                    'Giao diện cộng đồng đang được xây dựng. Hãy chờ đón một chợ nông sản số minh bạch và sôi động!'
                  )
                }
                className="w-full cursor-pointer rounded-lg bg-gray-200 py-3 font-semibold text-gray-500 transition hover:bg-gray-300"
              >
                Trải nghiệm tính năng
              </button>
            </div>

            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-[#F8F9FA] p-8 shadow-sm transition hover:shadow-md">
              <div className="absolute right-4 top-4 rounded-full bg-[#EDB324] px-3 py-1 text-xs font-bold text-white shadow-sm">
                Đang phát triển
              </div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200">
                <LineChart className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Thông báo giá nông sản</h3>
              <p className="mb-6 flex-grow text-gray-600">
                Cập nhật khách quan biến động giá cả thị trường mỗi ngày. Cung cấp bức tranh tổng thể để nhà nông tự tin làm
                chủ quyết định thu hoạch.
              </p>
              <button
                onClick={() =>
                  showModal('Thông báo giá', 'Hệ thống đang tích hợp API dữ liệu giá từ các chợ đầu mối. Tính năng sẽ sớm được kích hoạt.')
                }
                className="w-full cursor-pointer rounded-lg bg-gray-200 py-3 font-semibold text-gray-500 transition hover:bg-gray-300"
              >
                Trải nghiệm tính năng
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="triet-ly" className="bg-[#F8F9FA] py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <h2 className="mb-6 text-3xl font-bold text-[#3A9947]">Cánh chim Lạc vươn mình cùng địa cầu số</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start">
                <Bird className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-[#3A9947]" />
                <p>
                  <strong>Cánh Chim Lạc (Di sản):</strong> Lòng tự hào dân tộc và khát vọng vươn cao, ôm trọn những giá trị cốt lõi.
                </p>
              </div>
              <div className="flex items-start">
                <Globe className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-[#1CBECF]" />
                <p>
                  <strong>Quả Địa Cầu Số (Tầm nhìn):</strong> Giải quyết bài toán địa phương bằng chuẩn mực kết nối vạn vật (IoT)
                  toàn cầu.
                </p>
              </div>
              <div className="flex items-start">
                <Sprout className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-[#EDB324]" />
                <p>
                  <strong>Cây Lúa (Gốc rễ):</strong> Dù công nghệ hiện đại đến đâu, bệ phóng vững chắc nhất vẫn luôn là đồng ruộng và
                  người nông dân.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-2xl font-bold text-[#3A9947]">Tác động Xã hội (ESG)</h3>
            <p className="mb-6 text-gray-600">
              Thước đo thành công của Nông Lạc vượt ra khỏi ranh giới lợi nhuận, hướng tới <strong>Chỉ số Hạnh phúc Nông nghiệp</strong>:
            </p>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-center">
                <div className="mr-3 h-2 w-2 rounded-full bg-[#3A9947]" />
                <span>
                  <strong>Môi trường:</strong> Canh tác chính xác, giảm khí thải logistics.
                </span>
              </li>
              <li className="flex items-center">
                <div className="mr-3 h-2 w-2 rounded-full bg-[#1CBECF]" />
                <span>
                  <strong>Xã hội:</strong> Phổ cập tài chính cho người chưa có tài khoản ngân hàng.
                </span>
              </li>
              <li className="flex items-center">
                <div className="mr-3 h-2 w-2 rounded-full bg-[#EDB324]" />
                <span>
                  <strong>Quản trị:</strong> Bà con làm chủ dữ liệu. Sự tử tế được ghi nhận minh bạch.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="doi-ngu" className="bg-white py-20 text-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-[#3A9947]">Đội ngũ Sáng lập</h2>
          <p className="mb-12 text-lg text-gray-600">Những người trẻ sẵn sàng "lấm lem" cùng thực địa.</p>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                <User className="h-10 w-10" />
              </div>
              <h4 className="text-lg font-bold">Đức Huy</h4>
              <p className="text-sm font-medium text-[#3A9947]">Lead</p>
            </div>
            <div>
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                <Code className="h-10 w-10" />
              </div>
              <h4 className="text-lg font-bold">Văn Phú</h4>
              <p className="text-sm font-medium text-[#1CBECF]">Tech</p>
            </div>
            <div>
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                <PenTool className="h-10 w-10" />
              </div>
              <h4 className="text-lg font-bold">Trâm Anh</h4>
              <p className="text-sm font-medium text-[#EDB324]">Brand</p>
            </div>
            <div>
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                <Database className="h-10 w-10" />
              </div>
              <h4 className="text-lg font-bold">Ngọc Bích</h4>
              <p className="text-sm font-medium text-[#3A9947]">Data/Ops</p>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-2xl border-t border-gray-100 pt-8">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-gray-500">Cố vấn Chiến lược</p>
            <h4 className="text-xl font-bold">PGS.TS Đinh Tiên Minh</h4>
          </div>
        </div>
      </section>

      <footer className="bg-[#2D3748] py-12 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 text-center sm:px-6 md:grid-cols-2 md:text-left lg:px-8">
          <div>
            <h3 className="mb-2 text-2xl font-bold">NÔNG LẠC</h3>
            <p className="font-light italic text-gray-400">"Đưa nông sản Việt vươn xa, đôi chân vẫn bám sâu đồng ruộng."</p>
          </div>
          <div className="md:text-right">
            <p className="mb-2 text-gray-300">www.nonglac.com</p>
            <p className="text-gray-300">administration@nonglac.com</p>
          </div>
        </div>
      </footer>

      {modal.open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <button onClick={closeModal} className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600" aria-label="Close">
              <X className="h-6 w-6" />
            </button>
            <div className="mb-4 text-[#3A9947]">
              <Info className="h-10 w-10" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-[#2D3748]">{modal.title}</h3>
            <p className="mb-6 leading-relaxed text-gray-600">{modal.message}</p>
            <button onClick={closeModal} className="w-full rounded-lg bg-[#3A9947] py-3 font-bold text-white transition hover:bg-green-700">
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutUs;

