import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import 'antd/dist/reset.css';
import { Layout } from 'antd';
import { nongLacTheme } from './theme/nongLacTheme';
import ResponsiveNavbar from './components/ResponsiveNavbar';
import AdvancedSEO from './components/AdvancedSEO';
import PWAStatus from './components/PWAStatus';
import { AuthProvider } from './hooks/useAuth';
import { ChatProvider } from './contexts/ChatContext';
import { initPerformanceOptimizations } from './utils/performance';
import { initSentry } from './utils/sentry';
import { ErrorBoundary } from './utils/errorHandler';
import { initPerformanceMonitoring } from './utils/performanceMonitor';
import { initHealthMonitoring } from './utils/healthCheck';
import DailyBotScheduler from './components/DailyBotScheduler';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const ChatBot = React.lazy(() => import('./components/ChatBot'));
const Profile = React.lazy(() => import('./pages/Profile'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const SavedPosts = React.lazy(() => import('./pages/SavedPosts'));
const PostDetail = React.lazy(() => import('./pages/PostDetail'));
const Registration = React.lazy(() => import('./components/Registration/Registration'));
const PhoneLogin = React.lazy(() => import('./components/Login/PhoneLogin'));
const ForgotPassword = React.lazy(() => import('./components/ForgotPassword/ForgotPassword'));

const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const MessagesPage = React.lazy(() => import('./pages/MessagesPage'));
const Lessons = React.lazy(() => import('./pages/Lessons'));
const LessonView = React.lazy(() => import('./pages/LessonView'));
const PostGeneratorPage = React.lazy(() => import('./pages/PostGeneratorPage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminSetup = React.lazy(() => import('./pages/AdminSetup'));
const BotManagement = React.lazy(() => import('./pages/BotManagement'));
const GiaNongSan = React.lazy(() => import('./pages/GiaNongSan'));
const GiaCaPhe = React.lazy(() => import('./pages/GiaCaPhe'));
const GiaLuaGao = React.lazy(() => import('./pages/GiaLuaGao'));
const PlantDoctor = React.lazy(() => import('./pages/PlantDoctor'));
const MarketInsights = React.lazy(() => import('./pages/MarketInsights'));
const AgriMap = React.lazy(() => import('./pages/AgriMap'));
const ApiUsage = React.lazy(() => import('./pages/ApiUsage'));
const TestScraper = React.lazy(() => import('./pages/TestScraper'));
const MissionScreen = React.lazy(() => import('./components/Mission/MissionScreen'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const DesignDemo = React.lazy(() => import('./pages/DesignDemo'));



// Remove old theme - now using nongLacTheme

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <Spin size="large" />
  </div>
);

function App() {
  useEffect(() => {
    // Initialize Sentry first
    initSentry();
    
    // Initialize performance optimizations
    initPerformanceOptimizations();
    
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // Initialize health monitoring
    initHealthMonitoring();
    
    // Cache busting - kiểm tra phiên bản mới
    const checkForUpdates = () => {
      const buildTime = process.env.REACT_APP_BUILD_TIME;
      
      // Chỉ check update nếu có BUILD_TIME được set (production)
      if (!buildTime) return;
      
      const lastBuildTime = localStorage.getItem('app_build_time');
      
      if (lastBuildTime && lastBuildTime !== buildTime.toString()) {
        // Có phiên bản mới, reload trang
        localStorage.setItem('app_build_time', buildTime.toString());
        window.location.reload(true);
      } else if (!lastBuildTime) {
        localStorage.setItem('app_build_time', buildTime.toString());
      }
    };
    
    checkForUpdates();
    
    // Kiểm tra cập nhật mỗi 30 giây (chỉ ở production)
    const updateInterval = process.env.REACT_APP_BUILD_TIME 
      ? setInterval(checkForUpdates, 30000)
      : null;
    
    return () => {
      if (updateInterval) clearInterval(updateInterval);
    };
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ConfigProvider theme={nongLacTheme}>
          <AuthProvider>
            <ChatProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AdvancedSEO 
                title="NôngLạc - Mạng xã hội nông nghiệp hàng đầu Việt Nam"
                description="Kết nối cộng đồng nông dân Việt Nam. Chia sẻ kinh nghiệm trồng trọt, chăn nuôi và cập nhật giá nông sản realtime."
                keywords="nông nghiệp việt nam, nông dân, trồng trọt, chăn nuôi, giá nông sản, cộng đồng nông nghiệp"
                url={window.location.pathname}
              />
              <Layout style={{ minHeight: '100vh' }}>
                {/* PWA Status - Handle online/offline notifications */}
                <PWAStatus />
                
                {/* Beta Banner */}
                <div className="beta-banner">
                  <span className="beta-text">
                    🚧 Bản thử nghiệm - Không chịu trách nhiệm với dữ liệu 🚧
                  </span>
                </div>
                
                {/* Daily Bot Scheduler - Tự động gửi báo giá hàng ngày */}
                <DailyBotScheduler />
                
                <ResponsiveNavbar />
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lesson-view" element={<LessonView />} />
            <Route path="/saved" element={<SavedPosts />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/login" element={<PhoneLogin />} />
            <Route path="/phone-login" element={<PhoneLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/phone-register" element={<Registration />} />

            <Route path="/post-generator" element={<PostGeneratorPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/bot-management" element={<BotManagement />} />
            <Route path="/gia-nong-san" element={<GiaNongSan />} />
            <Route path="/gia-ca-phe" element={<GiaCaPhe />} />
            <Route path="/gia-lua-gao" element={<GiaLuaGao />} />
            <Route path="/plant-doctor" element={<PlantDoctor />} />
            <Route path="/market-insights" element={<MarketInsights />} />
            <Route path="/agri-map" element={<AgriMap />} />
            <Route path="/api-usage" element={<ApiUsage />} />
            <Route path="/test-scraper" element={<TestScraper />} />
            <Route path="/missions" element={<MissionScreen />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/design-demo" element={<DesignDemo />} />

            
            {/* SEO-friendly routes */}
            <Route path="/kinh-nghiem-nong-nghiep" element={<Home />} />
            <Route path="/ky-thuat-trong-trot" element={<Lessons />} />
            <Route path="/phuong-phap-chan-nuoi" element={<Lessons />} />
            <Route path="/tin-tuc-nong-nghiep" element={<Home />} />
            <Route path="/cong-nghe-nong-nghiep-4-0" element={<Home />} />
            <Route path="/dien-dan-nong-nghiep" element={<Home />} />
            <Route path="/cong-dong-nong-dan" element={<Home />} />
                  </Routes>
                </Suspense>
              </Layout>
              <Suspense fallback={null}>
                <ChatBot />
              </Suspense>
              </Router>
            </ChatProvider>
          </AuthProvider>
        </ConfigProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;