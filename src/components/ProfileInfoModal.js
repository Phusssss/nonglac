import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert
} from 'antd';

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

  return (
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
        {fields.map((field) => (
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
        ))}
      </Form>
    </Modal>
  );
};

export default ProfileInfoModal;