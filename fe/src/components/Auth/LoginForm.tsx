import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/AuthService';
import type { LoginRequestDTO } from '../../types/request/AuthRequestDTO';
import { GOOGLE_LOGIN_URL } from '../../constants/ApiConst';
import { Regex } from '../../constants/Regex';
import { RouteConst } from '../../constants/RouteConst';
import { USER_ROLES, STORAGE_KEYS } from '../../constants/AuthConst';
import './AuthStyles/LoginForm.scss';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginRequestDTO>({ emailOrPhone: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    if (savedEmail) {
      setForm((prev) => ({ ...prev, emailOrPhone: savedEmail }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Regex.EMAIL_OR_PHONE.test(form.emailOrPhone)) {
      setError(t('auth.login.invalidFormat'));
      return;
    }

    try {
      const data = await login(form);
      const { userId, fullName, role } = data;

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, form.emailOrPhone);
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }

      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      localStorage.setItem(STORAGE_KEYS.USER_NAME, fullName);
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);

      switch (role) {
        case USER_ROLES.ADMIN:
          navigate(RouteConst.ADMIN.ROOT);
          break;
        case USER_ROLES.EMPLOYEE:
          navigate(RouteConst.EMPLOYEE);
          break;
        default:
          navigate(RouteConst.HOME);
          break;
      }
    } catch (err: any) {
      const rawMsg = err.response?.data?.originMessage || err.response?.data?.message || '';
      let msg = t('auth.errors.serverError');
      if (rawMsg === 'Email hoặc số điện thoại không tồn tại trong hệ thống.' || rawMsg === 'Email or phone number does not exist in the system.') {
        msg = t('auth.login.emailOrPhoneNotFound');
      } else if (rawMsg === 'Mật khẩu không đúng.' || rawMsg === 'Incorrect password.') {
        msg = t('auth.login.passwordIncorrect');
      } else if (rawMsg.includes('not active')) {
        msg = t('auth.login.accountInactive');
      } else if (rawMsg.includes('not verified')) {
        msg = t('auth.login.emailNotVerified');
      } else if (rawMsg.includes('Invalid email/phone or password')) {
        msg = t('auth.login.invalidCredentials');
      }
      setError(msg);
    }
  };

  useEffect(() => {
    const errorParam = new URLSearchParams(window.location.search).get('error');
    if (errorParam === 'AccountInactive') {
      setError(t('auth.login.accountInactive'));
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    } else if (errorParam === 'GoogleLoginFailed') {
      setError(t('auth.login.googleLoginFailed'));
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    } else if (errorParam === 'SessionChanged') {
      setError(t('auth.login.sessionChanged'));
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    }
  }, []);

  const handleLoginWithGoogle = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <>
      <form className="login-box" onSubmit={handleSubmit}>
        <h1 className="logo">{t('auth.login.title')}</h1>

        <div className="input-group">
          <label>{t('auth.login.emailOrPhone')}</label>
          <div className="input-wrapper">
            <FaEnvelope className="icon" />
            <input
              type="text"
              name="emailOrPhone"
              placeholder={t('auth.login.emailOrPhone')}
              value={form.emailOrPhone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="input-group">
          <label>{t('auth.login.password')}</label>
          <div className="input-wrapper password-wrapper">
            <FaLock className="icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={t('auth.login.password')}
              value={form.password}
              onChange={handleChange}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="remember-forgot">
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe">{t('auth.login.rememberMe')}</label>
          </div>
          <button
            type="button"
            className="forgot-link"
            onClick={() => setShowForgotPassword(true)}
          >
            {t('auth.login.forgotPassword')}
          </button>
        </div>

        <div className="error-container">
          {error && <p className="error">{error}</p>}
        </div>

        <button type="submit" className="login-btn">
          {t('auth.login.signIn')}
        </button>

        <button type="button" className="loginwithgg-btn" onClick={handleLoginWithGoogle}>
          <FcGoogle style={{ marginRight: '8px', fontSize: '20px' }} />
          {t('auth.login.loginWithGoogle')}
        </button>

        <button type="button" className="signup-btn" onClick={() => navigate(RouteConst.REGISTER)}>
          {t('auth.login.signup')}
        </button>

        <button
          type="button"
          className="btn-back-home"
          onClick={() => navigate('/')}
          style={{ margin: '18px auto 0', display: 'block' }}
        >
          {t('common.backToHome', '← Back to Home')}
        </button>
      </form>

      {showForgotPassword && (
        <div className="forgot-overlay">
          <ForgotPasswordForm onClose={() => setShowForgotPassword(false)} />
        </div>
      )}
    </>
  );
}