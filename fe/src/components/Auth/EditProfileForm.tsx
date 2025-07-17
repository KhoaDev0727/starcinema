import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { UserOutlined } from '@ant-design/icons';
import { editProfile, getProfile, checkEmailUnique, checkPhoneUnique } from '../../services/AuthService';
import { Regex } from '../../constants/Regex';
import './AuthStyles/EditProfileForm.scss';
import dayjs from 'dayjs';

const { Option } = Select;

interface EditProfileFormProps {
  onClose?: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      const profileData = response.data;
      form.setFieldsValue({
        ...profileData,
        dateOfBirth: profileData.dateOfBirth ? dayjs(profileData.dateOfBirth) : null,
      });
    } catch (err: any) {
      setMessageText(err?.response?.data?.message || t('auth.editProfile.loadFailed'));
      setMessageType('error');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const checkUnique = async (field: string, value: string) => {
    try {
      if (field === 'email') {
        const res = await checkEmailUnique(value);
        return res.data.available;
      } else if (field === 'phone') {
        const res = await checkPhoneUnique(value);
        return res.data.available;
      }
      return null;
    } catch {
      return null;
    }
  };

  const validateForm = (values: any): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ỹ\s']{2,50}$/;
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    const identityRegex = /^[0-9]{9,12}$/;

    if (!nameRegex.test(values.fullName)) {
      setMessageText(t('auth.validation.invalidName'));
      setMessageType('error');
      return false;
    }

    if (values.fullName.length > 50) {
      setMessageText(t('auth.validation.nameTooLong'));
      setMessageType('error');
      return false;
    }

    if (!Regex.EMAIL.test(values.email)) {
      setMessageText(t('auth.validation.invalidEmail'));
      setMessageType('error');
      return false;
    }

    if (!phoneRegex.test(values.phoneNumber)) {
      setMessageText(t('auth.validation.invalidPhone'));
      setMessageType('error');
      return false;
    }

    if (!identityRegex.test(values.identityCard)) {
      setMessageText(t('auth.validation.invalidIdentityCard'));
      setMessageType('error');
      return false;
    }

    if (values.dateOfBirth) {
      const today = new Date();
      const birthDate = values.dateOfBirth.toDate();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (isNaN(birthDate.getTime()) || age < 16) {
        setMessageText(t('auth.validation.invalidAge'));
        setMessageType('error');
        return false;
      }
    }

    if (!values.gender || !['male', 'female', 'other'].includes(values.gender.toLowerCase())) {
      setMessageText(t('auth.validation.genderRequired'));
      setMessageType('error');
      return false;
    }

    if (!values.address || values.address.length < 5) {
      setMessageText(t('auth.validation.addressTooShort'));
      setMessageType('error');
      return false;
    }

    return true;
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    setMessageText('');
    setMessageType('');

    if (!validateForm(values)) {
      setLoading(false);
      return;
    }

    const originalValues = form.getFieldsValue();
    let hasError = false;

    if (values.email !== originalValues.email) {
      const isEmailUnique = await checkUnique('email', values.email);
      if (isEmailUnique === false) {
        setMessageText(t('auth.editProfile.emailExists'));
        setMessageType('error');
        hasError = true;
      } else if (isEmailUnique === null) {
        setMessageText(t('auth.editProfile.emailCheckFailed'));
        setMessageType('error');
        hasError = true;
      }
    }

    if (values.phoneNumber !== originalValues.phoneNumber) {
      const isPhoneUnique = await checkUnique('phone', values.phoneNumber);
      if (isPhoneUnique === false) {
        setMessageText(t('auth.editProfile.phoneExists'));
        setMessageType('error');
        hasError = true;
      } else if (isPhoneUnique === null) {
        setMessageText(t('auth.editProfile.phoneCheckFailed'));
        setMessageType('error');
        hasError = true;
      }
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      const response = await editProfile({
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : null,
      });
      
      setMessageText(response.message || t('auth.editProfile.success'));
      setMessageType('success');
      
      // Auto close after 2 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || err.message || '';
      let msg = t('auth.errors.serverError');
      
      if (rawMsg.includes('Email already exists')) {
        msg = t('auth.editProfile.emailExists');
      } else if (rawMsg.includes('Phone number already exists')) {
        msg = t('auth.editProfile.phoneExists');
      } else if (rawMsg.includes('Invalid data')) {
        msg = t('auth.validation.invalidData');
      } else {
        msg = rawMsg || t('auth.editProfile.failed');
      }
      
      setMessageText(msg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="edit-profile-form-wrapper">
        <div className="edit-profile-card">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="edit-profile-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <UserOutlined style={{ fontSize: 32, color: '#d32f2f', marginRight: 12 }} />
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#d32f2f', textAlign: 'center', letterSpacing: 1 }}>
          {t('auth.editProfile.title')}
        </h2>
      </div>
      
      <Form layout="vertical" form={form} onFinish={onFinish} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item 
            label={t('auth.editProfile.fullName')} 
            name="fullName" 
            rules={[{ required: true, message: t('auth.editProfile.fullName') }]} 
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label={t('auth.editProfile.email')} 
            name="email" 
            rules={[
              { type: 'email', message: t('auth.validation.invalidEmail') }, 
              { required: true, message: t('auth.editProfile.email') }
            ]} 
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item 
            label={t('auth.editProfile.phoneNumber')} 
            name="phoneNumber" 
            rules={[{ required: true, message: t('auth.editProfile.phoneNumber') }]} 
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label={t('auth.editProfile.address')} 
            name="address" 
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item 
            label={t('auth.editProfile.gender')} 
            name="gender" 
            style={{ flex: 1 }}
          >
            <Select placeholder={t('auth.editProfile.selectGender')}>
              <Option value="male">{t('auth.editProfile.male')}</Option>
              <Option value="female">{t('auth.editProfile.female')}</Option>
              <Option value="other">{t('auth.editProfile.other')}</Option>
            </Select>
          </Form.Item>
          <Form.Item 
            label={t('auth.editProfile.identityCard')} 
            name="identityCard" 
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item 
            label={t('auth.editProfile.dateOfBirth')} 
            name="dateOfBirth" 
            style={{ flex: 1 }}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <div style={{ flex: 1 }}></div>
        </div>
        
        <Form.Item style={{ minHeight: 44, marginBottom: 12, marginTop: 0, transition: 'min-height 0.2s' }}>
          {messageText && (
            <Alert
              className="edit-profile-message"
              message={messageText}
              type={messageType === 'success' ? 'success' : 'error'}
              showIcon={false}
            />
          )}
        </Form.Item>
        
        <Form.Item style={{ marginTop: 'auto', marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {loading ? t('common.loading') : t('auth.editProfile.saveChanges')}
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
    </>
  );
};

export default EditProfileForm;
