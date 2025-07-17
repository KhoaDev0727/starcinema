import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { changePassword } from '../../services/AuthService';
import { Regex } from '../../constants/Regex';
import { VALIDATION } from '../../constants/AuthConst';
import './AuthStyles/ChangePassword.scss';

interface ChangePasswordFormProps {
  onClose?: () => void;
}

const ChangePassword: React.FC<ChangePasswordFormProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null);
  const [generalMessage, setGeneralMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  const onFinish = async (values: any) => {
    setLoading(true);
    setOldPasswordError(null);
    setGeneralMessage(null);

    // Validation
    if (!values.oldPassword) {
      setGeneralMessage({
        type: 'error',
        content: t('auth.changePassword.oldPasswordRequired'),
      });
      setLoading(false);
      return;
    }

    if (!Regex.PASSWORD.test(values.newPassword)) {
      setGeneralMessage({
        type: 'error',
        content: t('auth.validation.passwordMinLength', { minLength: VALIDATION.PASSWORD_MIN_LENGTH }),
      });
      setLoading(false);
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      setGeneralMessage({
        type: 'error',
        content: t('auth.changePassword.passwordsDoNotMatch'),
      });
      setLoading(false);
      return;
    }

    if (values.oldPassword === values.newPassword) {
      setGeneralMessage({
        type: 'error',
        content: t('auth.changePassword.newPasswordSameAsOld'),
      });
      setLoading(false);
      return;
    }

    try {
      const response = await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      
      setGeneralMessage({ 
        type: 'success', 
        content: response.message || t('auth.changePassword.success') 
      });
      form.resetFields();
      
      // Auto close after 2 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || err.message || '';

      
      if (rawMsg.includes('Current password is incorrect')) {
        setOldPasswordError(t('auth.changePassword.incorrectCurrentPassword'));
      } else if (rawMsg.includes('Cannot change password for Google login accounts')) {
        setGeneralMessage({
          type: 'error',
          content: t('auth.changePassword.googleAccountError'),
        });
      } else if (rawMsg.includes('Invalid password format')) {
        setGeneralMessage({
          type: 'error',
          content: t('auth.validation.passwordMinLength', { minLength: VALIDATION.PASSWORD_MIN_LENGTH }),
        });
      } else {
        setGeneralMessage({ 
          type: 'error', 
          content: rawMsg || t('auth.changePassword.failed') 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Form.Item
        label={t('auth.changePassword.currentPassword')}
        name="oldPassword"
        validateStatus={oldPasswordError ? 'error' : ''}
        help={oldPasswordError || ''}
        rules={[{ required: true, message: t('auth.changePassword.oldPasswordRequired') }]}
      >
        <Input.Password placeholder={t('auth.changePassword.currentPassword')} />
      </Form.Item>

      <Form.Item
        label={t('auth.changePassword.newPassword')}
        name="newPassword"
        rules={[{ required: true, message: t('auth.changePassword.newPassword') }]}
      >
        <Input.Password placeholder={t('auth.changePassword.newPassword')} />
      </Form.Item>

      <Form.Item
        label={t('auth.changePassword.confirmPassword')}
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: t('auth.changePassword.confirmPassword') },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(t('auth.changePassword.passwordsDoNotMatch')));
            },
          }),
        ]}
      >
        <Input.Password placeholder={t('auth.changePassword.confirmPassword')} />
      </Form.Item>

      <Form.Item style={{ minHeight: 44, marginBottom: 12, marginTop: 0, transition: 'min-height 0.2s' }}>
        {generalMessage && (
          <Alert
            className="change-password-message"
            message={generalMessage.content}
            type={generalMessage.type}
            showIcon={false}
          />
        )}
      </Form.Item>

      <Form.Item style={{ marginTop: 'auto', marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {loading ? t('common.loading') : t('auth.changePassword.updatePassword')}
        </Button>
      </Form.Item>

      {onClose && (
        <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
          <Button type="default" onClick={onClose} block>
            {t('common.cancel')}
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default ChangePassword;
