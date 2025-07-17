import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AuthStyles/ForgotPasswordForm.scss';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaRegClock, FaKey } from 'react-icons/fa';
import type { ForgotPasswordRequestDTO, VerifyOtpRequestDTO, ResetPasswordRequestDTO } from '../../types/request/AuthRequestDTO';
import type { ForgotPasswordResponseDTO, VerifyOtpResponseDTO, ResetPasswordResponseDTO } from '../../types/response/AuthResponseDTO';
import { API_BASE_URL, FORGOT_PASSWORD_ENDPOINT, VERIFY_OTP_ENDPOINT, RESET_PASSWORD_ENDPOINT } from '../../constants/ApiConst';
import { RouteConst } from '../../constants/RouteConst';
import { VALIDATION } from '../../constants/AuthConst';
import { Regex } from '../../constants/Regex';

interface ForgotPasswordFormProps {
  onClose: () => void;
}

const ForgotPasswordForm = ({ onClose }: ForgotPasswordFormProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [message, setMessage] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendDisabled, setSendDisabled] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  const isValidEmail = (email: string) => Regex.EMAIL.test(email);
  const isStrongPassword = (password: string) =>
    password.length >= VALIDATION.PASSWORD_MIN_LENGTH && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password);

  const getI18nMessage = (msg: string, fallback: string) => {
    if (!msg) return fallback;
    const mapEnToKey: Record<string, string> = {
      'No user found with the provided email.': 'auth.register.emailNotFound',
      'Email not found.': 'auth.register.emailNotFound',
      'OTP has been sent to your email.': 'auth.forgotPassword.otpSent',
      'OTP sent successfully.': 'auth.forgotPassword.otpSent',
    };
    if (mapEnToKey[msg]) return t(mapEnToKey[msg]);
    if (msg.includes('.') && t(msg) !== msg) return t(msg);
    if (msg === fallback) return fallback;
    // Nếu không dịch được thì trả về fallback (luôn là i18n)
    return fallback;
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    // Khi hết thời gian đếm ngược ở bước OTP, xóa message
    if (step === 'otp' && resendCountdown === 0) {
      setMessage('');
    }
    return () => clearTimeout(timer);
  }, [resendCountdown, step]);

  const handleSendOtp = async () => {
    setMessage(''); // Reset message khi gửi lại OTP
    if (!isValidEmail(email)) {
      setMessage(t('auth.validation.invalidEmail'));
      return;
    }

    setSendDisabled(true);
    try {
      const payload: ForgotPasswordRequestDTO = { email };
      const res = await axios.post<ForgotPasswordResponseDTO>(`${API_BASE_URL}${FORGOT_PASSWORD_ENDPOINT}?email=${payload.email}`);
      setMessage(getI18nMessage(res.data.message, t('auth.forgotPassword.otpSent')));
      setStep('otp');
      setResendCountdown(60);
    } catch (err: any) {
      setMessage(getI18nMessage(err.response?.data?.message, t('auth.errors.serverError')));
      setSendDisabled(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const payload: VerifyOtpRequestDTO = { email, otp };
      const res = await axios.post<VerifyOtpResponseDTO>(`${API_BASE_URL}${VERIFY_OTP_ENDPOINT}`, null, {
        params: { email: payload.email, otp: payload.otp },
      });
      setMessage(getI18nMessage(res.data.message, t('auth.forgotPassword.otpVerified')));
      setOtpVerified(true);
      setStep('reset');
    } catch (err: any) {
      setMessage(getI18nMessage(err.response?.data?.message, t('auth.forgotPassword.invalidOtp')));
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      setMessage(t('auth.validation.passwordMinLength', { minLength: VALIDATION.PASSWORD_MIN_LENGTH }));
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      setMessage(t('auth.validation.passwordComplexity'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage(t('auth.validation.passwordMismatch'));
      return;
    }

    try {
      const payload: ResetPasswordRequestDTO = { email, newPassword };
      const res = await axios.post<ResetPasswordResponseDTO>(`${API_BASE_URL}${RESET_PASSWORD_ENDPOINT}`, null, {
        params: { email: payload.email, newPassword: payload.newPassword },
      });
      setMessage(getI18nMessage(res.data.message, t('auth.forgotPassword.passwordReset')));
      setTimeout(() => {
        onClose();
        window.location.href = RouteConst.LOGIN;
      }, 1500);
    } catch (err: any) {
      setMessage(getI18nMessage(err.response?.data?.message, t('auth.errors.serverError')));
    }
  };

  return (
    <div className="verify-overlay">
      <div className="verify-modal">
        <button className="btn-close" onClick={onClose} aria-label="close">
          ×
        </button>
        <div className="title-row">
          <span className="icon-lock-inline"><FaLock /></span>
          <h2 className="verify-title-inline">{t('auth.forgotPassword.title')}</h2>
        </div>
        {step === 'email' && (
          <>
            <p className="verify-desc" style={{marginTop: 16, marginBottom: 6, fontSize: 15, fontWeight: 500}}>{t('auth.forgotPassword.enterEmail').replace('Enter your email to receive a verification code.', 'Enter your email to get code.')}</p>
            <div className="input-group-modern input-group-compact">
              <FaEnvelope className="input-icon-modern" />
              <input
                type="email"
                placeholder={t('auth.forgotPassword.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="verify-input-modern input-compact"
              />
            </div>
            {message && (
              <span style={{ color: '#d32f2f', fontSize: 14, marginTop: 5, display: 'flex', alignItems: 'center', textAlign: 'left', paddingLeft: 16 }}>
                <span style={{ fontSize: 18, marginRight: 6 }}>
                  {message.includes('valid') ? '✔' : '❌'}
                </span>
                {message.replace(/^[\s✔✅❌]+/, '')}
              </span>
            )}
            <div className="button-group-modern button-group-row">
              <button className="btn-cancel-modern" onClick={onClose}>{t('auth.forgotPassword.cancel')}</button>
              <button onClick={handleSendOtp} className="btn-verify-modern" disabled={sendDisabled}>
                {sendDisabled ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendOtp')}
              </button>
            </div>
          </>
        )}
        {step === 'otp' && (
          <>
            <div className="otp-block">
              <p className="otp-label">{t('auth.forgotPassword.enterCode')} <strong>{email}</strong></p>
            </div>
            <div className="input-group-modern input-group-compact">
              <span className="input-icon-modern"><FaKey /></span>
              <input
                type="text"
                placeholder={t('auth.forgotPassword.otp')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="verify-input-modern input-compact"
              />
            </div>
            {message && (
              <span
                style={{
                  color: /sent|thành công|success/i.test(message) ? '#388e3c' : '#d32f2f',
                  fontSize: 14,
                  marginTop: 5,
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'left',
                  paddingLeft: 16
                }}
              >
                <span style={{ fontSize: 18, marginRight: 6 }}>
                  {/sent|thành công|success/i.test(message) ? '✔' : '❌'}
                </span>
                {message.replace(/^[\s✔✅❌]+/, '')}
              </span>
            )}
            {resendCountdown > 0 && (
              <p className="resend-timer-center">
                <span className="clock-icon"><FaRegClock /></span>
                {t('auth.forgotPassword.resendIn', { seconds: resendCountdown })}
              </p>
            )}
            <div className="button-group-modern button-group-row">
              <button onClick={handleVerifyOtp} className="btn-verify-modern">{t('auth.forgotPassword.verifyOtp')}</button>
              <button
                className="btn-resend"
                onClick={handleSendOtp}
                disabled={resendCountdown > 0}
              >
                {t('auth.forgotPassword.resendCode')}
              </button>
            </div>
          </>
        )}
        {step === 'reset' && otpVerified && (
          <>
            <p className="verify-desc">{t('auth.forgotPassword.enterNewPassword')}</p>
            <div style={{ width: '90%', margin: '0 auto 12px auto' }}>
              <div className="password-wrapper" style={{ marginBottom: 12 }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder={t('auth.forgotPassword.newPassword')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="verify-input-modern input-compact"
                />
                <span className="toggle-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="password-wrapper" style={{ marginBottom: 12 }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('auth.forgotPassword.confirmNewPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="verify-input-modern input-compact"
                />
                <span className="toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {message && (
                <span style={{ color: message.includes('thành công') || message.includes('success') ? '#388e3c' : '#d32f2f', fontSize: 14, marginTop: 5, display: 'flex', alignItems: 'center', textAlign: 'left', paddingLeft: 16 }}>
                  <span style={{ fontSize: 18, marginRight: 6 }}>
                    {message.includes('thành công') || message.includes('success') ? '✔' : '❌'}
                  </span>
                  {message.replace(/^[\s✔✅❌]+/, '')}
                </span>
              )}
            </div>
            <div className="button-group-modern button-group-row">
              <button className="btn-cancel-modern" onClick={onClose}>{t('auth.forgotPassword.cancel')}</button>
              <button onClick={handleResetPassword} className="btn-verify-modern">{t('auth.forgotPassword.resetPassword')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;