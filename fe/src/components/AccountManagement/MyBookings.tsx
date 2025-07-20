import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserBookings, getScheduleById, getMovieById } from '../../services/BookingService';
import BookingDetails from './BookingDetails';
import { API_BASE_URL } from '../../constants/ApiConst';
import defaultPoster from '../../assets/img/avatar.png';
import './styles/my-bookings.css';

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

const MyBookings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedules, setSchedules] = useState<{ [key: string]: Schedule }>({});
  const [movies, setMovies] = useState<{ [key: string]: Movie }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const bookingsPerPage = 5;

  const statusOptions = [
    { value: 'All', label: t('accountManagement.statusOptions.All', 'All') },
    { value: 'PENDING', label: t('accountManagement.statusOptions.PENDING', 'Pending') },
    { value: 'CONFIRMED', label: t('accountManagement.statusOptions.CONFIRMED', 'Confirmed') },
    { value: 'CANCELLED', label: t('accountManagement.statusOptions.CANCELLED', 'Cancelled') },
    { value: 'PAID', label: t('accountManagement.statusOptions.PAID', 'Paid') },
    { value: 'FAILED', label: t('accountManagement.statusOptions.FAILED', 'Failed') },
    { value: 'EXPIRED', label: t('accountManagement.statusOptions.EXPIRED', 'Expired') },
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookingsData = await getUserBookings();
        setBookings(bookingsData);

        if (bookingsData.length > 0) {
          const scheduleIds = [...new Set(bookingsData.map((b) => b.scheduleId))];
          const movieIds = new Set<string>();

          const schedulePromises = scheduleIds.map(async (id) => {
            const schedule = await getScheduleById(id);
            return schedule;
          });

          const schedulesData = await Promise.all(schedulePromises);
          const schedulesMap = schedulesData.reduce((acc, schedule) => {
            acc[schedule.scheduleId] = schedule;
            movieIds.add(schedule.movieId);
            return acc;
          }, {} as { [key: string]: Schedule });
          setSchedules(schedulesMap);

          const moviePromises = Array.from(movieIds).map(async (id) => {
            const movie = await getMovieById(id);
            return {
              ...movie,
              posterUrl: movie.posterUrl
                ? movie.posterUrl.startsWith('http')
                  ? movie.posterUrl
                  : `${API_BASE_URL}${movie.posterUrl}`
                : defaultPoster,
            } as Movie;
          });

          const moviesData = await Promise.all(moviePromises);
          const moviesMap = moviesData.reduce((acc, movie) => {
            acc[movie.movieId] = movie;
            return acc;
          }, {} as { [key: string]: Movie });
          setMovies(moviesMap);
        }

        setError(null);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        const errorMessage = err.response?.data?.originMessage || err.response?.data?.message || err.message;
        const isNoBookingsError = errorMessage && (
          errorMessage.includes('No bookings found') ||
          errorMessage.includes('No bookings found for userId')
        );

        if (isNoBookingsError) {
          setBookings([]);
          setSchedules({});
          setMovies({});
          setError(null);
        } else {
          setError(err.response?.data?.message || t('accountManagement.loadError', 'Failed to load bookings. Please try again.'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [t]);

  const filteredBookings = statusFilter === 'All'
    ? bookings
    : bookings.filter((booking) => booking.status === statusFilter);

  const sortedBookings = [...filteredBookings].sort((a, b) =>
    new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
  );

  const totalPages = Math.ceil(sortedBookings.length / bookingsPerPage);
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    const schedule = schedules[booking.scheduleId];
    const movie = schedule ? movies[schedule.movieId] : null;
    setBookingData({
      booking,
      movieTitle: movie?.title,
      posterUrl: movie?.posterUrl,
      showtime: schedule?.showtime,
      theaterId: schedule?.theaterId,
      roomId: schedule?.roomId,
    });
    setSelectedBookingId(booking.bookingId);
  };

  const handleCloseModal = () => {
    setSelectedBookingId(null);
    setBookingData(null);
  };

  return (
    <div className="my-bookings-container">
      <div className="filter-container">
        <label htmlFor="status-filter">{t('accountManagement.filterByStatus', 'Filter by Status')}:</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      {loading && (
        <div className="loading-container">
          <p className="loading-text">{t('accountManagement.loadingBookings', 'Loading bookings...')}</p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
        </div>
      )}
      
      {!loading && !error && sortedBookings.length === 0 && (
        <div className="no-bookings-container">
          <div className="no-bookings-icon">🎬</div>
          <h3 className="no-bookings-title">{t('accountManagement.noBookingsTitle', 'Chưa có vé đặt nào')}</h3>
          <p className="no-bookings-text">{t('accountManagement.noBookings', 'Bạn chưa có vé đặt nào. Hãy đặt vé để xem danh sách ở đây!')}</p>
          <div className="no-bookings-actions">
            <button 
              className="book-ticket-btn"
              onClick={() => window.location.href = '/'}
            >
              {t('accountManagement.bookTicket', 'Đặt vé ngay')}
            </button>
          </div>
        </div>
      )}
      
      {!loading && !error && sortedBookings.length > 0 && (
        <>
          <div className="bookings-list">
            {currentBookings.map((booking) => {
              const schedule = schedules[booking.scheduleId];
              const movie = schedule ? movies[schedule.movieId] : null;
              return (
                <div key={booking.bookingId} className="booking-card">
                  <img
                    src={movie?.posterUrl || defaultPoster}
                    alt={movie?.title || t('accountManagement.moviePoster', 'Movie Poster')}
                    className="booking-poster"
                    onError={(e) => {
                      e.currentTarget.src = defaultPoster;
                    }}
                  />
                  <div className="booking-details">
                    <h3 className="booking-movie-title">{movie?.title || t('accountManagement.unknownMovie', 'Unknown Movie')}</h3>
                    <p><strong>{t('accountManagement.bookingDate', 'Booking Date')}:</strong> {new Date(booking.bookingDate).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}</p>
                    <p><strong>{t('accountManagement.showtime', 'Showtime')}:</strong> {schedule?.showtime
                      ? new Date(schedule.showtime).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })
                      : t('accountManagement.na', 'N/A')}</p>
                    <p><strong>{t('accountManagement.amount', 'Amount')}:</strong> {booking.price.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} VND</p>
                    <p><strong>{t('accountManagement.status', 'Status')}:</strong> {t(`accountManagement.statusOptions.${booking.status}`, booking.status)}</p>
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(booking)}
                    >
                      {t('accountManagement.viewDetails', 'View Details')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {t('accountManagement.prev', 'Prev')}
              </button>
              <span className="pagination-info">
                {t('accountManagement.page', 'Page')} {currentPage} / {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t('accountManagement.next', 'Next')}
              </button>
            </div>
          )}
        </>
      )}
      {selectedBookingId && bookingData && (
        <BookingDetails bookingId={selectedBookingId} bookingData={bookingData} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default MyBookings;