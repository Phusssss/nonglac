import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import { Layout } from 'antd';
import ResponsiveNavbar from './components/ResponsiveNavbar';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import PriceUpdate from './pages/PriceUpdate';
import MarketData from './pages/MarketData';
import FoodPrices from './pages/FoodPrices';
import SavedPosts from './pages/SavedPosts';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import MessagesPage from './pages/MessagesPage';
import Lessons from './pages/Lessons';
import LessonView from './pages/LessonView';
import PostGeneratorPage from './pages/PostGeneratorPage';
import TailwindTest from './pages/TailwindTest';
import TestSvgComponent from './pages/TestSvgComponent';
import SvgToReactConverter from './pages/SvgToReactConverter';
import AdminDashboard from './pages/AdminDashboard';
import AdminSetup from './pages/AdminSetup';
import ToolsPage from './pages/ToolsPage';
import NongLacAI from './pages/NongLacAI';
import { AuthProvider } from './hooks/useAuth';
import { ChatProvider } from './contexts/ChatContext';


const antdTheme = {
  token: {
    colorPrimary: '#1877F2',
    colorSuccess: '#42B883',
    colorBgLayout: '#F0F2F5',
    borderRadius: 8,
  },
};

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <Layout style={{ minHeight: '100vh' }}>
              <ResponsiveNavbar />
              <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/prices" element={<PriceUpdate />} />
            <Route path="/food-prices" element={<FoodPrices />} />
            <Route path="/market" element={<MarketData />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lesson-view" element={<LessonView />} />
            <Route path="/saved" element={<SavedPosts />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/post-generator" element={<PostGeneratorPage />} />
            <Route path="/tailwind-test" element={<TailwindTest />} />
            <Route path="/test-svg" element={<TestSvgComponent />} />
            <Route path="/svg-converter" element={<SvgToReactConverter />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/nonglac-ai" element={<NongLacAI />} />
              </Routes>

            </Layout>
            <ChatBot />
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;