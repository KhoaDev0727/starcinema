import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RouteConst } from '../../constants/RouteConst';

const BookingSuccess: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 bg-white shadow-lg flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-[#00B14F] text-center">
        {t('booking.success.title')}
      </h1>
      <p className="text-lg text-gray-600 mt-2 text-center">
        {t('booking.success.message')}
      </p>
      <button
        className="mt-6 bg-[#00B14F] text-white font-semibold text-sm px-8 py-2 rounded-full hover:bg-[#009640] transition"
        onClick={() => navigate(RouteConst.HOME)}
      >
        {t('booking.success.backToHome')}
      </button>
    </div>
  );
};

export default BookingSuccess;