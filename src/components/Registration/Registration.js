import React, { useState } from 'react';
import { Steps, Card, Typography } from 'antd';
import PhoneStep from './PhoneStep';
import PersonalInfoStep from './PersonalInfoStep';
import PasswordStep from './PasswordStep';
import registrationService from '../../services/registrationService';
import logo from '../../assets/images/logo.demo.nontext.png';

const { Title } = Typography;

const steps = [
  {
    title: 'Số điện thoại',
    description: 'Nhập số điện thoại'
  },
  {
    title: 'Thông tin cơ bản',
    description: 'Tên người dùng, giới tính, tuổi'
  },
  {
    title: 'Mật khẩu',
    description: 'Tạo mật khẩu'
  }
];

const Registration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
