// src/components/Header.tsx
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HomeStyles/Header.scss';
import defaultLogo from '../../assets/img/bg-logo-cinema.png';
import vietnameflag from '../../assets/img/vietnamflag.png';
import usflag from '../../assets/img/usflag.png';
import { FaUserCircle } from 'react-icons/fa';
import EditProfileForm from '../Auth/EditProfileForm';
import ChangePassword from '../Auth/ChangePassword';
import LanguageSwitcher from '../../Common/LanguageSwitcher';

interface BreadcrumbItem {
  text: string;
  step: 'movies' | 'showtimes' | 'seats' | 'confirm' | 'mybookings' | 'theaters' | 'editProfile' | 'changePassword' | 'profile' | 'home' | 'score';
  onClick?: () => void;
}

interface HeaderProps {
  breadcrumbs: BreadcrumbItem[];
  onStepChange?: (step: BreadcrumbItem['step']) => void;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
}

interface User {
  userId: number;
  fullName: string;
  role: string;
  status: string;
}

function decodeCookieValue(value?: string) {
  if (!value) return '';
  return decodeURIComponent(value.replace(/\+/g, ' '));
}

const Header: React.FC<HeaderProps> = ({ breadcrumbs, onStepChange, onEditProfile, onChangePassword }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = Cookies.get('userId');
    const fullName = decodeCookieValue(Cookies.get('fullName'));
    const role = decodeCookieValue(Cookies.get('role'));
    const status = decodeCookieValue(Cookies.get('status'));

    if (userId && fullName && role && status) {
      setUser({
        userId: Number(userId),
        fullName,
        role,
        status,
      });
    } else {
      setUser(null);
    }

    const savedLang = localStorage.getItem('language');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const dropdown = document.querySelector('.profile-dropdown');
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isProfileDropdownOpen]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:8080/api/login/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    setUser(null);
    Cookies.remove('userId');
    Cookies.remove('fullName');
    Cookies.remove('role');
    Cookies.remove('status');
    setLoading(false);
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setIsLangDropdownOpen(false);
  };

  const toggleLangDropdown = () => {
    setIsLangDropdownOpen(!isLangDropdownOpen);
  };

  return (
    <>
      <div className="top-border"></div>
      <header>
        <div className="header-container">
          <div className="logo-nav">
            <img
              className="logo"
              src={defaultLogo}
              alt="Star Theater logo"
              height={50}
              width={100}
            />
            <nav>
              <a href="#" onClick={(e) => { e.preventDefault(); onStepChange?.('movies'); }}>{t('header.home')}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onStepChange?.('movies'); }}>{t('header.movies')}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onStepChange?.('theaters'); }}>{t('header.theaters')}</a>
              <a href="#">{t('header.promotions')}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onStepChange?.('score'); }}>{t('header.score')}</a>
              {user && (
                <a href="#" onClick={(e) => { e.preventDefault(); onStepChange?.('mybookings'); }}>
                  {t('header.myBookings')}
                </a>
              )}
            </nav>
          </div>
          <div className="user-info" style={{ marginLeft: 'auto', paddingRight: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="wave" style={{ fontSize: 22 }}>👋</span>
                  {t('header.hi')} <b>{user.fullName}</b>
                </span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => setIsProfileDropdownOpen((v) => !v)}
                  aria-label="Profile menu"
                >
                  <FaUserCircle size={28} color="#333" />
                </button>
                {isProfileDropdownOpen && (
                  <div className="profile-dropdown" style={{ position: 'absolute', top: 40, right: 0, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minWidth: 180, zIndex: 100 }}>
                    <button className="profile-dropdown-item" style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer' }} onClick={() => { onEditProfile?.(); setIsProfileDropdownOpen(false); }}>✏️ {t('profile.editProfile')}</button>
                    <button className="profile-dropdown-item" style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer' }} onClick={() => { onChangePassword?.(); setIsProfileDropdownOpen(false); }}>🔒 {t('profile.changePassword')}</button>
                    <button className="profile-dropdown-item" style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', color: '#d32f2f', cursor: 'pointer' }} onClick={handleLogout}>{loading ? t('profile.loggingOut', { ns: 'translation' }) : t('profile.logout', { ns: 'translation' })}</button>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login" style={{ color: '#f66' }}>
                Login
              </a>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <div className="bottom-border"></div>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a
          href="#"
          className="breadcrumb-home"
          onClick={(e) => {
            e.preventDefault();
            breadcrumbs[0]?.onClick?.();
          }}
          aria-label="Home"
        >
          <i className="fas fa-home"></i>
        </a>
        {breadcrumbs.map((item) => (
          <React.Fragment key={item.step}>
            <span className="breadcrumb-separator">
              <i className="fas fa-chevron-right"></i>
            </span>
            {item.onClick ? (
              <a
                href="#"
                className="breadcrumb-link"
                onClick={(e) => {
                  e.preventDefault();
                  item.onClick?.();
                }}
              >
                {t(item.text)}
              </a>
            ) : (
              <span className="breadcrumb-active">{t(item.text)}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
};

export default Header;