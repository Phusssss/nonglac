import React, { useState, useEffect } from 'react';
import { Steps, Card, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import PhoneStep from './PhoneStep';
import PersonalInfoStep from './PersonalInfoStep';
import StudentInfoStep from './StudentInfoStep';
import ReferralCodeStep from './ReferralCodeStep';
import PasswordStep from './PasswordStep';
import registrationService from '../../services/registrationService';
import logo from '../../assets/images/logo.demo.nontext.png';

const { Title } = Typography;

const getSteps = (isStudent) => {
  const baseSteps = [
    {
      title: 'Số điện thoại',
      description: 'Nhập số điện thoại'
    },
    {
      title: 'Thông tin cơ bản',
      description: 'Tên người dùng, giới tính, tuổi'
    }
  ];

  if (isStudent) {
    baseSteps.push({
      title: 'Thông tin sinh viên',
      description: 'Mã sinh viên, trường học'
    });
  }

  baseSteps.push(
    {
      title: 'Mã Giới Thiệu',
      description: 'Nhập mã giới thiệu (tùy chọn)'
    },
    {
      title: 'Mật khẩu',
      description: 'Tạo mật khẩu'
    }
  );

  return baseSteps;
};

const Registration = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const userType = searchParams.get('userType');
  const isStudent = userType === 'student';
  const steps = getSteps(isStudent);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Xóa toàn bộ dữ liệu đăng nhập khi truy cập trang đăng ký
  useEffect(() => {
    // Reset dữ liệu trong service
    registrationService.resetRegistrationData();
    
    // Đăng xuất khỏi Firebase để xóa session
    signOut(auth).catch(() => {
      // Bỏ qua lỗi nếu chưa đăng nhập
    });
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleReset = () => {
    setActiveStep(0);
    setError('');
    registrationService.resetRegistrationData();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <PhoneStep
            onNext={handleNext}
            setLoading={setLoading}
            setError={setError}
            loading={loading}
            error={error}
          />
        );
      case 1:
        return (
          <PersonalInfoStep
            onNext={handleNext}
            onBack={handleBack}
            setLoading={setLoading}
            setError={setError}
            loading={loading}
            error={error}
          />
        );
      case 2:
        if (isStudent) {
          return (
            <StudentInfoStep
              onNext={handleNext}
              onBack={handleBack}
              setLoading={setLoading}
              setError={setError}
              loading={loading}
              error={error}
            />
          );
        }
        // For non-students, case 2 is referral code
        return (
          <ReferralCodeStep
            onNext={handleNext}
            onBack={handleBack}
            setLoading={setLoading}
            setError={setError}
            loading={loading}
            error={error}
            initialCode={referralCode}
          />
        );
      case 3:
        if (isStudent) {
          return (
            <ReferralCodeStep
              onNext={handleNext}
              onBack={handleBack}
              setLoading={setLoading}
              setError={setError}
              loading={loading}
              error={error}
              initialCode={referralCode}
            />
          );
        }
        // For non-students, case 3 is password
        return (
          <PasswordStep
            onBack={handleBack}
            onReset={handleReset}
            setLoading={setLoading}
            setError={setError}
            loading={loading}
            error={error}
          />
        );
      case 4:
        // Only for students (password step)
        if (isStudent) {
          return (
            <PasswordStep
              onBack={handleBack}
              onReset={handleReset}
              setLoading={setLoading}
              setError={setError}
              loading={loading}
              error={error}
            />
          );
        }
        return 'Unknown step';
      default:
        return 'Unknown step';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <div className="text-center mb-8">
            <img src={logo} alt="NongLac Logo" className="h-16 w-auto mx-auto mb-4" />
            <Title level={2} className="text-[#4CAF50] mb-2">
              Đăng ký tài khoản
            </Title>
          </div>

          <Steps
            current={activeStep}
            items={steps}
            className="mb-8"
            size="small"
          />

          <div>
            {renderStepContent(activeStep)}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Registration;
