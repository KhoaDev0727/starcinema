import React from 'react';
import './HomeStyles/Footer.scss';
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from '../../constants/ContactConst';
import defaultLogo from '../../assets/img/bg-logo-cinema.png';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer-container">
      <div className="top-border"></div>
      <div className="footer-content">
        <div className="footer-columns">
          <div className="footer-col">
            <img src={defaultLogo} alt="Star Theater logo" height={100} style={{ marginBottom: 14 }} />
            <div className="footer-title">Star Theater</div>
            <div className="footer-info-item"><i className="fas fa-map-marker-alt"></i> {CONTACT_ADDRESS}</div>
            <div className="footer-info-item"><i className="fas fa-envelope"></i> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div>
            <div className="footer-info-item"><i className="fas fa-phone"></i> <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a></div>
          </div>
          <div className="footer-col">
            <div className="footer-title">{t('footer.terms')}</div>
            <a href="#">{t('footer.terms')}</a>
            <a href="#">{t('footer.privacy')}</a>
            <a href="#">{t('footer.faq')}</a>
            <a href="#">{t('footer.help')}</a>
          </div>
          <div className="footer-col">
            <div className="footer-title">{t('footer.connect')}</div>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-title">{t('footer.customerCare')}</div>
            <div>{t('footer.hotline')}: <a href="tel:02773945672">02773945672</a></div>
            <div>{t('footer.workingHours')}: 8:00 - 22:00</div>
            <div>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div>
          </div>
        </div>
        <div className="footer-divider-strong"></div>
        <div className="footer-company-row">
          <div className="footer-company-info">
            <b>STAR THEATER VIETNAM</b> | {t('footer.copyright')}<br />
            {t('footer.address')}: {CONTACT_ADDRESS} | {t('footer.phone')}: {CONTACT_PHONE}
          </div>
        </div>
      </div>
      <div className="bottom-border"></div>
    </footer>
  );
};

export default Footer; 