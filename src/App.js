import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Spin, App as AntApp } from 'antd';
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
import versionService from './services/versionService';
import { ProtectionProvider } from './contexts/ProtectionContext';
import protectionConfig from './config/protectionConfig';
import { initPerformanceOptimizer, scheduleIdleTask } from './utils/performanceOptimizer';

// Lazy load components
const Home = React.lazy(() => import('./features/home'));
const ChatBot = React.lazy(() => import('./components/ChatBot'));
const Profile = React.lazy(() => import('./features/profile'));
const UserProfile = React.lazy(() => import('./features/user-profile'));

const PostDetail = React.lazy(() => import('./pages/PostDetail'));
const Registration = React.lazy(() => import('./components/Registration/Registration'));
const PhoneLogin = React.lazy(() => import('./components/Login/PhoneLogin'));


const Marketplace = React.lazy(() => import('./features/marketplace/marketplace'));
const ProductDetail = React.lazy(() => import('./features/marketplace'));
const MessagesPage = React.lazy(() => import('./features/messages'));

const AdminDashboard = React.lazy(() => import('./features/admin'));


const PlantDoctor = React.lazy(() => import('./pages/PlantDoctor'));
const MarketInsights = React.lazy(() => import('./pages/MarketInsights'));
const LatestCoffeePrices = React.lazy(() => import('./pages/LatestCoffeePrices'));
const AgriMap = React.lazy(() => import('./pages/AgriMap'));
const AIVideoCall = React.lazy(() => import('./pages/AIVideoCall'));

const MissionScreen = React.lazy(() => import('./features/missions'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const StudentAffiliateProgram = React.lazy(() => import('./pages/StudentAffiliateProgram'));




// Remove old theme - now using nongLacTheme

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <Spin size="large" />
  </div>
);

function App() {
  useEffect(() => {
    // Initialize critical services immediately
    initSentry();
    initPerformanceOptimizer();
    
    // Defer non-critical initializations
    scheduleIdleTask(() => {
      initPerformanceOptimizations();
      initPerformanceMonitoring();
      initHealthMonitoring();
      versionService.init();
    });
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ConfigProvider theme={nongLacTheme}>
          <AntApp>
            <ProtectionProvider config={protectionConfig}>
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
                    Phiên bản beta 1.0
                  </span>
                </div>
                
                {/* Daily Bot Scheduler - Tự động gửi báo giá hàng ngày */}
                <DailyBotScheduler />
                
                <ResponsiveNavbar />
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="pb-24 lg:pb-0">
                    <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/messages" element={<MessagesPage />} />


              <Route path="/post/:postId" element={<PostDetail />} />
              <Route path="/login" element={<PhoneLogin />} />
              <Route path="/phone-login" element={<PhoneLogin />} />

              <Route path="/register" element={<Registration />} />
              <Route path="/phone-register" element={<Registration />} />

              <Route path="/admin" element={<AdminDashboard />} />


              <Route path="/plant-doctor" element={<PlantDoctor />} />
              <Route path="/market-insights" element={<MarketInsights />} />
              <Route path="/gia-ca-phe-hom-nay" element={<LatestCoffeePrices />} />
              <Route path="/gia-nong-san" element={<LatestCoffeePrices />} />
              <Route path="/agri-map" element={<AgriMap />} />
              <Route path="/ai-video-call" element={<AIVideoCall />} />

              <Route path="/missions" element={<MissionScreen />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy" element={<TermsOfService />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/student-affiliate-program" element={<StudentAffiliateProgram />} />


              
              {/* SEO-friendly routes */}
              <Route path="/kinh-nghiem-nong-nghiep" element={<Home />} />

              <Route path="/tin-tuc-nong-nghiep" element={<Home />} />
              <Route path="/cong-nghe-nong-nghiep-4-0" element={<Home />} />
              <Route path="/dien-dan-nong-nghiep" element={<Home />} />
              <Route path="/cong-dong-nong-dan" element={<Home />} />
                    </Routes>
                  </div>
                </Suspense>
              </Layout>
              <Suspense fallback={null}>
                <ChatBot />
              </Suspense>
              </Router>
                </ChatProvider>
              </AuthProvider>
            </ProtectionProvider>
          </AntApp>
        </ConfigProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
