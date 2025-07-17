import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './AuthStyles/RegisterForm.scss';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaPhone, FaBirthdayCake, FaIdCard, FaTransgender, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequestDTO } from '../../types/request/AuthRequestDTO';
import { GENDER_OPTIONS } from '../../constants/AuthConst';
import { checkEmailExists, checkPhoneExists } from '../../services/AuthService';

interface RegisterFormProps {
  form: RegisterRequestDTO & { confirmPassword: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  message: string;
  isSubmitting: boolean;
  fieldErrors?: { 
    email?: string; 
    phoneNumber?: string; 
    identityCard?: string;
    password?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    confirmPassword?: string;
  };
}

export const RegisterForm = ({
  form,
  onChange,
  onSubmit,
  message,
  isSubmitting,
  fieldErrors = {},
}: RegisterFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [localFieldErrors, setLocalFieldErrors] = useState<{ email?: string; phoneNumber?: string }>({});

  const handleBack = () => {
    navigate('/login');
  };

  // Validate email khi blur
  const handleEmailBlur = async () => {
    if (form.email) {
      const exists = await checkEmailExists(form.email);
      setLocalFieldErrors((prev) => ({ ...prev, email: exists ? 'Email đã được sử dụng.' : undefined }));
    }
  };

  // Validate phone khi blur
  const handlePhoneBlur = async () => {
    if (form.phoneNumber) {
      const exists = await checkPhoneExists(form.phoneNumber);
      setLocalFieldErrors((prev) => ({ ...prev, phoneNumber: exists ? 'Số điện thoại đã được sử dụng.' : undefined }));
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <form
          onSubmit={(e) => {
            if (!agreed) {
              e.preventDefault();
              alert(t('auth.register.termsRequired'));
              return;
            }
            onSubmit(e);
          }}
          className="register-form-box"
        >
          <h1 className="logo">{t('auth.register.title')}</h1>

          <div className="form-grid">
            <div className="form-row">
              <div className="input-group">
                <label>{t('auth.register.fullName')}</label>
                <div className="input-wrapper">
                  <FaUser className="icon" />
                  <input 
                    name="fullName" 
                    placeholder={t('auth.register.fullName')} 
                    value={form.fullName} 
                    onChange={onChange} 
                    required 
                  />
                </div>
                <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.fullName ? '#d93025' : 'transparent', marginTop: 2 }}>
                  {fieldErrors.fullName || '.'}
                </div>
              </div>
              <div className="input-group">
                <label>{t('auth.register.email')}</label>
                <div className="input-wrapper">
                  <FaEnvelope className="icon" />
                  <input 
                    type="text" 
                    name="email" 
                    placeholder="you@example.com" 
                    value={form.email} 
                    onChange={onChange} 
                    onBlur={handleEmailBlur}
                    required 
                  />
                </div>
                <div style={{ minHeight: 16, fontSize: 12, color: (fieldErrors.email || localFieldErrors.email) ? '#d93025' : 'transparent', marginTop: 2 }}>
                  {fieldErrors.email || localFieldErrors.email || '.'}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>{t('auth.register.phoneNumber')}</label>
                <div className="input-wrapper">
                  <FaPhone className="icon" />
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    placeholder="e.g. 0901234567" 
                    value={form.phoneNumber} 
                    onChange={onChange} 
                    onBlur={handlePhoneBlur}
                    required 
                  />
                </div>
                <div style={{ minHeight: 16, fontSize: 12, color: (fieldErrors.phoneNumber || localFieldErrors.phoneNumber) ? '#d93025' : 'transparent', marginTop: 2 }}>
                  {fieldErrors.phoneNumber || localFieldErrors.phoneNumber || '.'}
                </div>
              </div>
              <div className="input-group">
                <label>{t('auth.register.identityCard')}</label>
                <div className="input-wrapper">
                  <FaIdCard className="icon" />
                  <input 
                    name="identityCard" 
                    placeholder="e.g. 012345678901" 
                    value={form.identityCard} 
                    onChange={onChange} 
                    required 
                  />
                </div>
                <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.identityCard ? '#d93025' : 'transparent', marginTop: 2 }}>
                  {fieldErrors.identityCard || '.'}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>{t('auth.register.password')}</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <FaLock className="icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="********"
                    value={form.password}
                    onChange={onChange}
                    required
                  />
                  <span
                    className="eye-icon"
                    style={{ cursor: 'pointer', position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.password ? '#d93025' : 'transparent', marginTop: 2 }}>
                  {fieldErrors.password || '.'}
                </div>
              </div>
              <div className="input-group">
                <label>{t('auth.register.confirmPassword')}</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <FaLock className="icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="********"
                    value={form.confirmPassword}
                    onChange={onChange}
                    required
                  />
                  <span
                    className="eye-icon"
                    style={{ cursor: 'pointer', position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.confirmPassword ? '#d93025' : 'transparent', marginTop: 2 }}>
                  {fieldErrors.confirmPassword || '.'}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>{t('auth.register.dateOfBirth')}</label>
                <div className="input-wrapper">
                  <FaBirthdayCake className="icon" />
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    value={form.dateOfBirth} 
                    onChange={onChange} 
                    required 
                  />
                </div>
                <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.dateOfBirth ? '#d93025' : 'transparent', marginTop: 2 }}>
                  {fieldErrors.dateOfBirth || '.'}
                </div>
              </div>
              <div className="input-group">
                <label>{t('auth.register.address')}</label>
                <div className="input-wrapper">
                  <FaMapMarkerAlt className="icon" />
                  <input 
                    name="address" 
                    placeholder="e.g. 123 Main St" 
                    value={form.address} 
                    onChange={onChange} 
                    required 
                  />
                </div>
                <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.address ? '#d93025' : 'transparent', marginTop: 2 }}>
                  {fieldErrors.address || '.'}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>{t('auth.register.gender')}</label>
                <div className="input-wrapper">
                  <FaTransgender className="icon" />
                  <select 
                    name="gender" 
                    value={form.gender} 
                    onChange={onChange} 
                    required
                  >
                    <option value="">{t('auth.register.selectGender')}</option>
                    <option value={GENDER_OPTIONS.MALE}>{t('auth.register.male')}</option>
                    <option value={GENDER_OPTIONS.FEMALE}>{t('auth.register.female')}</option>
                    <option value={GENDER_OPTIONS.OTHER}>{t('auth.register.other')}</option>
                  </select>
                </div>
                <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.gender ? '#d93025' : 'transparent', marginTop: 2 }}>
                  {fieldErrors.gender || '.'}
                </div>
              </div>
            </div>
          </div>

          <div className="checkbox-agree">
            <input type="checkbox" id="agree" checked={agreed} onChange={() => setAgreed(!agreed)} />
            <label htmlFor="agree">
              <span>
                {t('auth.register.termsAgreement')}{' '}
                <button type="button" className="terms-link" onClick={() => setShowTerms(true)}>
                  {t('auth.register.termsOfService')}
                </button>{' '}
                {t('auth.register.and')}{' '}
                <a href="/privacy" target="_blank">
                  {t('auth.register.privacyPolicy')}
                </a>.
              </span>
            </label>
          </div>

          {message && !Object.values(fieldErrors).some(Boolean) && !/successful/i.test(message) && (
            <div className={`my-error-alert ${message ? 'show' : ''}`} style={{ margin: '0 0 14px 0' }}>
              <span className="error-text">{message}</span>
            </div>
          )}

          <div className="button-row">
            <button type="button" className="action-btn" onClick={handleBack} disabled={isSubmitting}>
              {t('auth.register.back')}
            </button>
            <button type="submit" className="action-btn" disabled={isSubmitting || !agreed}>
              {t('auth.register.signUp')}
            </button>
          </div>
        </form>

        {showTerms && (
          <div className="terms-overlay">
            <div className="terms-modal">
              <h2 style={{ color: '#b71c1c', marginBottom: 16 }}>{t('privacyPolicy.title')}</h2>
              <div style={{ textAlign: 'left', maxHeight: 320, overflowY: 'auto', fontSize: 15, marginBottom: 18, whiteSpace: 'pre-line' }}>
                {(t('privacyPolicy.content', { returnObjects: true }) as string[]).map((line, idx) => (
                  <div key={idx} style={{ marginBottom: 6 }}>{line}</div>
                ))}
              </div>
              <button onClick={() => setShowTerms(false)} className="btn-verify" style={{ marginTop: 8 }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};