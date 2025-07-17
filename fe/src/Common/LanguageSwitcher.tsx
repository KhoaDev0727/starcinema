import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.scss';
import usFlag from '../assets/img/usflag.png';
import vietnamFlag from '../assets/img/vietnamflag.png';

const languages = [
  { code: 'en', name: 'English', flag: usFlag },
  { code: 'vi', name: 'Tiếng Việt', flag: vietnamFlag },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setLanguage(lng);
    setOpen(false);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && savedLang !== language) {
      changeLanguage(savedLang);
    }
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="language-switcher-compact" ref={ref}>
      <button className="lang-toggle-btn" onClick={() => setOpen((o) => !o)}>
        <img src={currentLang.flag} alt={currentLang.name} className="flag-icon" />
        {currentLang.name}
        <span className="dropdown-arrow">▼</span>
      </button>
      <div className={`lang-dropdown${open ? '' : ' hidden'}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`lang-option${language === lang.code ? ' active' : ''}`}
            onClick={() => changeLanguage(lang.code)}
            disabled={language === lang.code}
          >
            <img src={lang.flag} alt={lang.name} className="flag-icon" />
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
