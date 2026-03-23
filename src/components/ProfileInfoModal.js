import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert
} from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import LocationPickerModal from './LocationPickerModal';

const { TextArea } = Input;

/**
 * Modal bổ sung thông tin profile - Dùng chung cho missions và profile page
 */
const ProfileInfoModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  title = "Bổ sung thông tin",
  fields = [],
  loading = false 
}) => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [locationPickerLoading, setLocationPickerLoading] = useState(false);

  // Initialize form fields when modal opens
  React.useEffect(() => {
    if (open) {
      const initialValues = {};
      fields.forEach(field => {
        initialValues[field.id] = '';
      });
      form.setFieldsValue(initialValues);
    }
  }, [open, fields, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleLocationConfirm = (lat, lng) => {
    form.setFieldsValue({
      coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    });
    setLocationPickerOpen(false);
  };

  const handleOpenLocationPicker = () => {
    const coordinates = form.getFieldValue('coordinates');
    let initialLat = null;
    let initialLng = null;
    
    if (coordinates) {
      const [lat, lng] = coordinates.split(',').map(v => parseFloat(v.trim()));
      initialLat = lat;
      initialLng = lng;
    }
    
    setLocationPickerOpen(true);
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
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          {fields.map((field) => {
            // Location picker fields
            if (field.type === 'location') {
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Input
                      placeholder={field.placeholder}
                      readOnly
                      style={{ backgroundColor: '#f5f5f5', flex: 1 }}
                    />
                    <Button
                      type="primary"
                      icon={<EnvironmentOutlined />}
                      onClick={handleOpenLocationPicker}
                    >
                      Chọn vị trí
                    </Button>
                  </div>
                </Form.Item>
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

      {/* Location Picker Modal */}
      <LocationPickerModal
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onConfirm={handleLocationConfirm}
        initialLat={
          (() => {
            const coordinates = form.getFieldValue('coordinates');
            if (coordinates) {
              const [lat] = coordinates.split(',').map(v => parseFloat(v.trim()));
              return lat;
            }
            return null;
          })()
        }
        initialLng={
          (() => {
            const coordinates = form.getFieldValue('coordinates');
            if (coordinates) {
              const [, lng] = coordinates.split(',').map(v => parseFloat(v.trim()));
              return lng;
            }
            return null;
          })()
        }
        loading={locationPickerLoading}
      />
    </>
  );
};

export default ProfileInfoModal;