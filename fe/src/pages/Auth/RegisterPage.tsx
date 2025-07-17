import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from '../../components/Auth/RegisterForm';
import { register, verifyRegisterCode, resendRegisterCode, testApiConnection, testRegisterEndpoint } from '../../services/AuthService';
import type { RegisterRequestDTO } from '../../types/request/AuthRequestDTO';
import './styles/RegisterPage.scss';
import { FaKey, FaRegClock, FaLock } from 'react-icons/fa';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState<RegisterRequestDTO & { confirmPassword: string }>({
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    identityCard: '',
    email: '',
    address: '',
    phoneNumber: '',
  });

  const [message, setMessage] = useState('');
  const [showVerifyOverlay, setShowVerifyOverlay] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ 
    email?: string; 
    phoneNumber?: string; 
    identityCard?: string;
    password?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    confirmPassword?: string;
  }>({});

  const [otpStartTime, setOtpStartTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(60);
  const [otpExpired, setOtpExpired] = useState(false);

  const navigate = useNavigate();

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      console.log('🔍 Testing API connection on RegisterPage mount...');
      const isConnected = await testApiConnection();
      if (!isConnected) {
        console.warn('⚠️ API connection test failed');
      }
      
      // Test register endpoint specifically
      console.log('🔍 Testing register endpoint...');
      const isRegisterWorking = await testRegisterEndpoint();
      if (!isRegisterWorking) {
        console.warn('⚠️ Register endpoint test failed');
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    if (!otpStartTime) return;

    setRemainingTime(60);
    setOtpExpired(false);

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - otpStartTime) / 1000);
      const timeLeft = 60 - elapsed;

      if (timeLeft <= 0) {
        setOtpExpired(true);
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpStartTime]);

  const validateFields = (fields = form) => {
    const errors: typeof fieldErrors = {};
    // Số điện thoại Việt Nam hợp lệ (đầu số di động hợp lệ)
    if (fields.phoneNumber && !/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/.test(fields.phoneNumber)) {
      errors.phoneNumber = t('auth.validation.invalidPhone');
    }
    // CCCD hợp lệ (9-12 số)
    if (fields.identityCard && !/^[0-9]{9,12}$/.test(fields.identityCard)) {
      errors.identityCard = t('auth.validation.invalidIdentityCard');
    }
    // Ngày sinh hợp lệ (theo CGV: phải đủ 16 tuổi trở lên)
    if (fields.dateOfBirth) {
      const dob = new Date(fields.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (isNaN(dob.getTime()) || age < 16 || dob > today) {
        errors.dateOfBirth = t('auth.validation.invalidAge');
      }
    }
    // Full name: 2-50 ký tự, không số, không ký tự lạ, chỉ ký tự tiếng Việt và khoảng trắng
    if (fields.fullName) {
      const fullName = fields.fullName.trim();
      if (fullName.length < 2) {
        errors.fullName = t('auth.validation.fullNameMinLength', { minLength: 2 });
      } else if (fullName.length > 50) {
        errors.fullName = t('auth.validation.fullNameMaxLength', { maxLength: 50 });
      } else if (!/^([A-Za-zÀ-ỹà-ỹ\s']+)$/.test(fullName)) {
        errors.fullName = t('auth.validation.invalidFullName');
      }
    }
    // Password: ít nhất 8 ký tự, có chữ hoa, thường, số, ký tự đặc biệt
    if (fields.password) {
      if (fields.password.length < 8) {
        errors.password = t('auth.validation.passwordMinLength', { minLength: 8 });
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(fields.password)) {
        errors.password = t('auth.validation.passwordComplexity');
      }
    }
    // Confirm password: phải trùng khớp
    if (fields.password && fields.confirmPassword && fields.password !== fields.confirmPassword) {
      errors.confirmPassword = t('auth.validation.passwordMismatch');
    }
    // Gender: bắt buộc
    if (!fields.gender) {
      errors.gender = t('auth.validation.genderRequired');
    }
    // Email: kiểm tra định dạng hợp lệ nâng cao (giống CGV)
    if (fields.email) {
      // Regex: không bắt đầu/kết thúc bằng dấu chấm, không có 2 dấu chấm liên tiếp, chỉ cho phép ký tự hợp lệ
      const emailRegex = /^(?![.])[A-Za-z0-9._%+-]+@(?![.])[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?<![.])$/;
      if (!emailRegex.test(fields.email) || /\.\./.test(fields.email)) {
        errors.email = t('auth.validation.invalidEmail');
      }
    }
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    // Validate realtime từng trường
    const errors = validateFields(newForm);
    setFieldErrors((prev) => ({ ...prev, [name]: errors[name as keyof typeof fieldErrors] }));
    if (message) setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({}); // reset lỗi trước khi submit
    setMessage('');

    // --- VALIDATE LOCAL ---
    const localErrors = validateFields();
    let mergedFieldErrors = { ...localErrors };
    // Nếu có lỗi format thì không gửi lên backend, chỉ hiển thị lỗi format
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(mergedFieldErrors);
      setIsSubmitting(false);
      return;
    }

    const {
      fullName,
      password,
      confirmPassword,
      dateOfBirth,
      gender,
      identityCard,
      email,
      address,
      phoneNumber,
    } = form;

    // Client-side validation for confirm password
    if (password !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Mật khẩu không khớp.' }));
      setIsSubmitting(false);
      return;
    }

    try {
      const { confirmPassword, ...formData } = form;
      const response = await register(formData);
      // Xử lý response mới với thông tin chi tiết về email/phone/identityCard đã được sử dụng
      if (response.emailUsed || response.phoneUsed || response.identityCardUsed) {
        let newFieldErrors: { email?: string; phoneNumber?: string; identityCard?: string } = {};
        if (response.emailUsed) newFieldErrors.email = t('auth.validation.emailAlreadyExists');
        if (response.phoneUsed) newFieldErrors.phoneNumber = t('auth.validation.phoneAlreadyExists');
        if (response.identityCardUsed) newFieldErrors.identityCard = t('auth.validation.invalidIdentityCard');
        setFieldErrors({ ...localErrors, ...newFieldErrors });
        setMessage('');
        return;
      }
      // Nếu không có lỗi từng trường, set message tổng như cũ
      setMessage(response.message);
      setFieldErrors({});
      localStorage.setItem("register_email", email);
      if (response.message.toLowerCase().includes('successful')) {
        setShowVerifyOverlay(true);
        setOtpStartTime(Date.now());
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.status === 400 && err.response?.data) {
        // Xử lý lỗi chi tiết từ BE trả về
        const { emailUsed, phoneUsed, identityCardUsed, fieldErrors: beFieldErrors } = err.response.data;
        let newFieldErrors: { email?: string; phoneNumber?: string; identityCard?: string } = {};
        if (emailUsed) newFieldErrors.email = t('auth.validation.emailAlreadyExists');
        if (phoneUsed) newFieldErrors.phoneNumber = t('auth.validation.phoneAlreadyExists');
        if (identityCardUsed) newFieldErrors.identityCard = t('auth.validation.invalidIdentityCard');
        // Áp dụng i18n cho các lỗi BE trả về nếu có
        let mergedFieldErrors: Record<string, string> = { ...localErrors, ...newFieldErrors };
        if (beFieldErrors) {
          Object.entries(beFieldErrors).forEach(([key, value]) => {
            // Nếu BE trả về đúng key, ưu tiên dùng i18n nếu có
            if (key === 'passwordMismatch') mergedFieldErrors['confirmPassword'] = t('auth.validation.passwordMismatch');
            else if (key === 'password') mergedFieldErrors['password'] = t('auth.validation.passwordComplexity');
            else mergedFieldErrors[key] = value as string;
          });
        }
        setFieldErrors(mergedFieldErrors);
        setMessage('');
        return;
      }
      if (err.response?.status === 405) {
        setMessage(t('auth.errors.invalidFormat'));
      } else if (err.response?.status === 404) {
        setMessage(t('auth.errors.notFound'));
      } else if (err.response?.status === 500) {
        setMessage(t('auth.errors.serverError'));
      } else if (err.response?.data?.fieldErrors) {
        // Handle validation errors from backend
        const backendFieldErrors = err.response.data.fieldErrors;
        setFieldErrors({ ...localErrors, ...backendFieldErrors });
        setMessage(t('auth.errors.invalidFormat'));
      } else if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        setMessage(errorMessage);
      } else if (err.message) {
        setMessage(err.message);
      } else {
        setMessage(t('auth.errors.serverError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    setShowResendSuccess(false); // Ẩn thông báo gửi thành công khi xác thực
    const email = form.email || localStorage.getItem("register_email");
    if (!email) {
      setVerifyMessage(t('auth.register.emailNotFound'));
      return;
    }
    if (otpExpired) {
      setVerifyMessage(t('auth.register.codeExpiredError'));
      return;
    }

    try {
      const response = await verifyRegisterCode(email, verificationCode);
      setVerifyMessage(t('auth.register.verifiedSuccess'));
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Verification error:', err);
      if (err.response?.data?.message) {
        const beMsg = err.response.data.message as string;
        if (beMsg && (beMsg.toLowerCase().includes('incorrect') || beMsg.toLowerCase().includes('already used'))) {
          setVerifyMessage(t('auth.register.invalidCodeError'));
        } else {
          setVerifyMessage(`❌ ${beMsg}`);
        }
      } else {
        setVerifyMessage(t('auth.register.invalidCodeError'));
      }
    }
  };

  const handleResend = async () => {
    const email = form.email || localStorage.getItem("register_email");
    if (!email) {
      setVerifyMessage(t('auth.register.emailNotFound'));
      return;
    }

    setIsResending(true);
    setVerifyMessage(''); // Reset thông báo lỗi khi resend
    try {
      await resendRegisterCode(email);
      setShowResendSuccess(true);
      setOtpStartTime(Date.now());
    } catch (err: any) {
      console.error('Resend error:', err);
      setVerifyMessage(t('auth.register.resendFailed'));
    } finally {
      setIsResending(false);
    }
  };

  const handleCancel = () => {
    setShowVerifyOverlay(false);
    setVerificationCode('');
    setVerifyMessage('');
    setOtpStartTime(null);
    setRemainingTime(120);
    setOtpExpired(false);
  };

  return (
    <div className="register-page">
      {!showVerifyOverlay ? (
        <RegisterForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          message={message}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
        />
      ) : (
        <div className="verify-overlay">
          <div className="verify-modal" style={{ display: 'flex', flexDirection: 'column' }}>
            <button className="btn-close" onClick={handleCancel} aria-label="close">
              ×
            </button>
            <div className="title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
              <span className="icon-lock-inline" style={{ fontSize: 24, color: '#b71c1c', display: 'flex', alignItems: 'center' }}><FaLock /></span>
              <h2 className="verify-title-inline" style={{ fontSize: 22, fontWeight: 'bold', color: '#b71c1c', margin: 0 }}>{t('auth.register.verifyEmail')}</h2>
            </div>
            <div className="otp-block">
              <p className="otp-label">{t('auth.register.sentToYourEmail')} <strong>{form.email}</strong></p>
            </div>
            <div className="input-group-modern input-group-compact">
              <span className="input-icon-modern"><FaKey /></span>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={t('auth.forgotPassword.otp') || 'Nhập OTP'}
                maxLength={6}
                className="verify-input-modern input-compact"
              />
            </div>
            {/* Thông báo gửi OTP thành công và verifyMessage sát ô input */}
            <div style={{ minHeight: 24, marginTop: 8, marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%' }}>
              {otpExpired || remainingTime <= 0 ? (
                <div className="verify-msg" style={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                  <span style={{ fontSize: 16 }}>⏰</span>
                  {t('auth.forgotPassword.otpExpired') || 'OTP has expired.'}
                </div>
              ) : (showResendSuccess || (remainingTime === 120 && !verifyMessage)) && (
                <div className="verify-msg otp-success" style={{ color: '#388e3c', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                  <span style={{ fontSize: 16 }}>✔</span>
                  {t('auth.forgotPassword.otpSent')}
                </div>
              )}
              {verifyMessage && !otpExpired && remainingTime > 0 && (
                <div className={`verify-msg${verifyMessage.includes('OTP') ? ' otp-success' : ''}`}>{verifyMessage}</div>
              )}
            </div>
            {/* Đồng hồ đếm ngược nằm giữa ô input và nhóm nút, luôn giữ chỗ với minHeight */}
            <div style={{ minHeight: 32, margin: '44px 0 0 0', textAlign: 'center' }}>
              {remainingTime > 0 && (
                <p className="resend-timer-center" style={{ margin: 0 }}>
                  <span className="clock-icon"><FaRegClock /></span>
                  {t('auth.forgotPassword.resendIn', { seconds: remainingTime })}
                </p>
              )}
            </div>
            {/* Nhóm nút luôn sát cạnh dưới nội dung modal */}
            <div style={{ marginTop: 'auto' }}>
              <div className="button-group-modern button-group-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                <button
                  className="btn-resend"
                  onClick={handleResend}
                  disabled={isResending || remainingTime > 0}
                >
                  {t('auth.forgotPassword.resendCode')}
                </button>
                <button onClick={handleVerify} className="btn-verify-modern">{t('auth.forgotPassword.verifyOtp')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};