import React from 'react';
import PromotionList from '../../components/PromotionManagement/PromotionList';
import './styles/PromotionManagementPage.scss';
import { useTranslation } from 'react-i18next';

const PromotionManagementPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="promotion-management-page">
      <div className="page-header">
        <h1 className="admin-section-title">{t('promotion.title')}</h1>
      </div>
      
      <PromotionList />
    </div>
  );
};

export default PromotionManagementPage; 