import React from 'react';
import { Alert, Button, Space } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import {
  getErrorMessage,
  isNetworkError,
  shouldRetry,
  normalizeVietnameseText
} from '../../constants/errorMessages';

/**
 * ErrorDisplay Component - Hiển thị lỗi một cách thống nhất
 * @param {Object} props
 * @param {Error|string} props.error - Lỗi cần hiển thị
 * @param {Function} props.onRetry - Callback khi người dùng nhấn thử lại
 * @param {boolean} props.showRetry - Hiển thị nút thử lại
 * @param {boolean} props.showSupport - Hiển thị nút liên hệ hỗ trợ
 * @param {'error'|'warning'|'info'} props.type - Loại alert
 * @param {boolean} props.closable - Có thể đóng alert
 * @param {string} props.className - CSS class tùy chỉnh
 */
const ErrorDisplay = ({
  error,
  onRetry,
  showRetry = true,
  showSupport = false,
  type = 'error',
  closable = false,
  className = ''
}) => {
  if (!error) return null;

  let errorMessage;
  let isNetwork = false;
  let canRetry = false;

  if (typeof error === 'string') {
    errorMessage = normalizeVietnameseText(error);

    if (
      errorMessage.includes('Số điện thoại hoặc mật khẩu không đúng') ||
      errorMessage.includes('không đúng') ||
      errorMessage.includes('không hợp lệ')
    ) {
      canRetry = false;
    } else {
      canRetry = true;
    }
  } else {
    errorMessage = getErrorMessage(error);
    isNetwork = isNetworkError(error);
    canRetry = shouldRetry(error);
  }

  const getIcon = () => {
    if (isNetwork) return <ReloadOutlined />;
    return <ExclamationCircleOutlined />;
  };

  const getAlertType = () => {
    if (isNetwork) return 'warning';
    return type;
  };

  const renderActions = () => {
    const actions = [];

    if (showRetry && canRetry && onRetry) {
      actions.push(
        <Button
          key="retry"
          type="primary"
          size="small"
          icon={<ReloadOutlined />}
          onClick={onRetry}
        >
          Thử lại
        </Button>
      );
    }

    if (showSupport) {
      actions.push(
        <Button
          key="support"
          type="default"
          size="small"
          icon={<CustomerServiceOutlined />}
          onClick={() => {
            window.open('mailto:support@nonglac.com', '_blank');
          }}
        >
          Liên hệ hỗ trợ
        </Button>
      );
    }

    return actions.length > 0 ? (
      <Space size="small" className="mt-2">
        {actions}
      </Space>
    ) : null;
  };

  return (
    <div className={className}>
      <Alert
        message="Có lỗi xảy ra"
        description={(
          <div>
            <div className="mb-2">{errorMessage}</div>
            {renderActions()}
          </div>
        )}
        type={getAlertType()}
        icon={getIcon()}
        closable={closable}
        showIcon
      />
    </div>
  );
};

export default ErrorDisplay;
