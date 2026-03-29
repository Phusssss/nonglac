import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert
} from 'antd';
import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import LocationPickerModal from './LocationPickerModal';
import FarmAddressItem from './FarmAddressItem';

const { TextArea } = Input;
const EMPTY_ARRAY = [];

/**
 * Modal bổ sung thông tin profile - Dùng chung cho missions và profile page
 */
const ProfileInfoModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  title = "Bổ sung thông tin",
  fields = [],
  loading = false,
  initialFarmAddresses = EMPTY_ARRAY
}) => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [locationPickerLoading, setLocationPickerLoading] = useState(false);
  const [farmAddresses, setFarmAddresses] = useState([]);
  const lastOpenRef = React.useRef(false);

  // Initialize form fields when modal opens
  React.useEffect(() => {
    // Chỉ khởi tạo khi trạng thái open chuyển từ false -> true
    if (open && !lastOpenRef.current) {
      lastOpenRef.current = true;
      const initialValues = {};
      let hasFarmAddressField = false;
      
      fields.forEach(field => {
        if (field.type === 'farm-addresses') {
          hasFarmAddressField = true;
          // Nếu có initialFarmAddresses, sử dụng nó; nếu không thì khởi tạo ít nhất 1 ô nhập liệu
          if (initialFarmAddresses && initialFarmAddresses.length > 0) {
            setFarmAddresses(initialFarmAddresses);
          } else {
            setFarmAddresses([{
              id: Date.now(),
              address: '',
              farmType: '',
              coordinates: '',
              description: ''
            }]);
          }
        } else {
          initialValues[field.id] = '';
        }
      });
      
      form.setFieldsValue(initialValues);
      
      // Cleanup nếu không có field farm-addresses
      if (!hasFarmAddressField) {
        setFarmAddresses([]);
      }
    } else if (!open && lastOpenRef.current) {
      // Khi đóng modal, reset ref để có thể khởi tạo lại ở lần mở sau
      lastOpenRef.current = false;
    }
  }, [open, fields, form, initialFarmAddresses]);

  const handleSubmit = async () => {
    try {
      // Validate farm addresses
      if (fields.some(f => f.type === 'farm-addresses')) {
        if (farmAddresses.length === 0) {
          throw new Error('Vui lòng thêm ít nhất một địa chỉ canh tác');
        }
        
        // Validate each address
        for (const addr of farmAddresses) {
          if (!addr.address || !addr.farmType || !addr.coordinates) {
            throw new Error('Vui lòng điền đầy đủ thông tin cho tất cả địa chỉ');
          }
        }
      }

      const values = await form.validateFields();
      setSubmitLoading(true);
      
      // Add farm addresses to values
      if (fields.some(f => f.type === 'farm-addresses')) {
        values.farmAddresses = farmAddresses;
      }
      
      await onSubmit(values);
      form.resetFields();
      setFarmAddresses([]);
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFarmAddresses([]);
    onClose();
  };

  const handleAddFarmAddress = () => {
    const newAddress = {
      id: Date.now(),
      address: '',
      farmType: '',
      coordinates: '',
      description: ''
    };
    setFarmAddresses([...farmAddresses, newAddress]);
  };

  const handleUpdateFarmAddress = (index, updatedAddress) => {
    const newAddresses = [...farmAddresses];
    newAddresses[index] = updatedAddress;
    setFarmAddresses(newAddresses);
  };

  const handleDeleteFarmAddress = (index) => {
    setFarmAddresses(farmAddresses.filter((_, i) => i !== index));
  };

  return (
    <>
      <Modal
        title={title}
        open={open}
        onCancel={handleClose}
        footer={[
          <Button key="cancel" onClick={handleClose} disabled={submitLoading}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={submitLoading || loading}
            onClick={handleSubmit}
          >
            Lưu thông tin
          </Button>
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          {fields.map((field) => {
            // Farm addresses field
            if (field.type === 'farm-addresses') {
              return (
                <div key={field.id}>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="block text-sm font-medium mb-2">{field.label}</label>
                    <p className="text-xs text-gray-500 mb-3">{field.helperText}</p>
                  </div>

                  {/* Farm Addresses List */}
                  <div style={{ marginBottom: '16px' }}>
                    {farmAddresses.map((address, index) => (
                      <FarmAddressItem
                        key={address.id}
                        index={index}
                        address={address}
                        onUpdate={handleUpdateFarmAddress}
                        onDelete={handleDeleteFarmAddress}
                        form={form}
                      />
                    ))}
                  </div>

                  {/* Add Address Button */}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={handleAddFarmAddress}
                  >
                    Thêm địa chỉ canh tác
                  </Button>
                </div>
              );
            }

            // Regular text fields
            return (
              <Form.Item
                key={field.id}
                name={field.id}
                label={field.label}
                rules={[
                  {
                    required: field.required,
                    message: `${field.label} là bắt buộc`
                  }
                ]}
                help={field.helperText}
              >
                {field.multiline ? (
                  <TextArea
                    placeholder={field.placeholder}
                    rows={field.rows || 3}
                    autoSize={{ minRows: field.rows || 3, maxRows: 6 }}
                  />
                ) : (
                  <Input
                    placeholder={field.placeholder}
                    type={field.type || 'text'}
                  />
                )}
              </Form.Item>
            );
          })}
        </Form>
      </Modal>
    </>
  );
};

export default ProfileInfoModal;