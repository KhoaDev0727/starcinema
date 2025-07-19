import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import defaultPoster from '../../assets/img/avatar.png';
import defaultLogo from '../../assets/img/bg-logo-cinema.png';
import "./styles/booking-details.css";
import { useTranslation } from 'react-i18next';
import { cancelBooking } from '../../services/BookingService';
import { DeleteOutlined } from '@ant-design/icons';

interface Booking {
  bookingId: string;
  userId: string;
  scheduleId: string;
  seatId: string;
  bookingDate: string;
  status: string;
  promotionId?: string;
  price: number;
}

interface Schedule {
  scheduleId: string;
  movieId: string;
  roomId: string;
  theaterId: string;
  showtime: string;
  price: number;
}

interface Movie {
  movieId: string;
  title: string;
  posterUrl?: string;
}

interface BookingDetailsProps {
  bookingId: string;
  bookingData?: {
    booking: Booking;
    movieTitle: string;
    posterUrl?: string;
    showtime: string;
    theaterId: string;
    roomId: string;
  };
  onClose: () => void;
}

function decodeCookieValue(value?: string) {
  if (!value) return '';
  return decodeURIComponent(value.replace(/\+/g, ' '));
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ bookingId, bookingData, onClose }) => {
  const { t, i18n } = useTranslation();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const userName = decodeCookieValue(Cookies.get('fullName')) || 'Anonymous Customer';

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);

        if (bookingData) {
          console.log('Use bookingData:', bookingData);
          setBooking(bookingData.booking);
          setSchedule({
            scheduleId: bookingData.booking.scheduleId,
            movieId: '',
            roomId: bookingData.roomId,
            theaterId: bookingData.theaterId,
            showtime: bookingData.showtime,
            price: bookingData.booking.price,
          });
          setMovie({
            movieId: '',
            title: bookingData.movieTitle || 'Unknown Movie',
            posterUrl: bookingData.posterUrl || defaultPoster,
          });
          setError(null);
          setLoading(false);
          return;
        }

        const bookingResponse = await axios.get(`${API_BASE_URL}/book/v1/bookings/${bookingId}`, {
          withCredentials: true,
        });
        const bookingDataFetched: Booking = bookingResponse.data;
        setBooking(bookingDataFetched);

        const scheduleResponse = await axios.get(`${API_BASE_URL}/book/v1/schedule/id/${bookingDataFetched.scheduleId}`, {
          withCredentials: true,
        });
        const scheduleData: Schedule = scheduleResponse.data;
        setSchedule(scheduleData);

        const movieResponse = await axios.get(`${API_BASE_URL}/book/v1/movie/${scheduleData.movieId}`, {
          withCredentials: true,
        });
        const movieData: Movie = {
          ...movieResponse.data,
          posterUrl: movieResponse.data.posterUrl
            ? movieResponse.data.posterUrl.startsWith('http')
              ? movieResponse.data.posterUrl
              : `${API_BASE_URL}${movieResponse.data.posterUrl}`
            : defaultPoster,
        };
        setMovie(movieData);

        setError(null);
      } catch (err: any) {
        console.error('Error fetching booking details:', err);
        setError(err.response?.data?.message || t('accountManagement.bookingDetailsNotFound', 'Booking details not found.'));
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    } else {
      setError('Invalid booking ID.');
      setLoading(false);
    }
  }, [bookingId, bookingData, t, API_BASE_URL]);

  if (loading) {
    return <p className="loading-text">{t('accountManagement.loadingBookingDetails', 'Loading booking details...')}</p>;
  }

  if (error || !booking || !schedule || !movie) {
    return <p className="error-text">{error || t('accountManagement.bookingDetailsNotFound', 'Booking details not found.')}</p>;
  }

  const displayMovieTitle = bookingData?.movieTitle || movie.title;
  const movieImage = movie.posterUrl && !movie.posterUrl.startsWith('/api/book/v1')
    ? movie.posterUrl
    : bookingData?.posterUrl || defaultPoster;

  const canCancel = booking.status === 'PENDING' && (new Date(schedule.showtime).getTime() - Date.now() > 6 * 60 * 60 * 1000);

  const handleCancelBooking = async () => {
    setCancelling(true);
    setCancelError(null);
    setCancelSuccess(null);
    try {
      await cancelBooking(booking.bookingId);
      setCancelSuccess(t('accountManagement.cancelSuccess', 'Huỷ vé thành công!'));
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      let errorMsg = t('accountManagement.cancelError', 'Huỷ vé thất bại!');
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (typeof err.response.data === 'object' && err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      setCancelError(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="booking-details-modal">
      <div className="booking-details-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="booking-details-header">
          <img
            className="logo"
            src={defaultLogo}
            alt={t('accountManagement.logoAlt', 'Star Theater logo')}
            height={50}
            width={100}
          />
          <div>
            <h1 className="booking-details-title">{t('accountManagement.bookingDetails', 'Booking Details')}</h1>
            <p className="booking-details-subtitle">{t('accountManagement.bookingId', 'Booking ID')}: {booking.bookingId}</p>
          </div>
        </div>
        <div className="booking-details-body">
          <div className="booking-details-poster">
            <img
              src={movieImage}
              alt={displayMovieTitle}
              className="poster-image"
              onError={(e) => (e.currentTarget.src = defaultPoster)}
            />
          </div>
          <div className="booking-details-info">
            <h2 className="section-title">{t('accountManagement.bookingInfo', 'Booking Information')}</h2>
            <p><strong>{t('accountManagement.bookedBy', 'Booked by')}:</strong> {userName}</p>
            <p><strong>{t('accountManagement.movie', 'Movie')}:</strong> {displayMovieTitle}</p>
            <p><strong>{t('accountManagement.bookingDate', 'Booking Date')}:</strong> {new Date(booking.bookingDate).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}</p>
            <p><strong>{t('accountManagement.showtime', 'Showtime')}:</strong> {new Date(schedule.showtime).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}</p>
            <p><strong>{t('accountManagement.theater', 'Theater')}:</strong> {schedule.theaterId}</p>
            <p><strong>{t('accountManagement.room', 'Room')}:</strong> {schedule.roomId}</p>
            <p><strong>{t('accountManagement.seat', 'Seat')}:</strong> {booking.seatId}</p>
            <p><strong>{t('accountManagement.amount', 'Amount')}:</strong> {booking.price.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} VND</p>
            <p><strong>{t('accountManagement.status', 'Status')}:</strong> {t(`accountManagement.statusOptions.${booking.status}`, booking.status)}</p>
            {booking.promotionId && <p><strong>{t('accountManagement.promotionId', 'Promotion ID')}:</strong> {booking.promotionId}</p>}
            {canCancel && (
              <div className="cancel-btn-wrapper">
                <button className="cancel-booking-btn" onClick={handleCancelBooking} disabled={cancelling}>
                  <DeleteOutlined style={{ marginRight: 8, fontSize: 18 }} />
                  {cancelling ? t('accountManagement.cancelling', 'Đang huỷ...') : t('accountManagement.cancelBooking', 'Huỷ vé')}
                </button>
              </div>
            )}
            {cancelSuccess && <p className="success-text">{cancelSuccess}</p>}
            {cancelError && <p className="error-text">{cancelError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;