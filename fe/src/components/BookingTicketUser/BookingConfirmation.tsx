import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getMovieById, getScheduleById, confirmBooking, getSeatsBySchedule } from '../../services/BookingService';
import type { 
  MovieResponseDTO, 
  ScheduleResponseDTO, 
  BookingResponseDTO,
  ScheduleSeatResponseDTO 
} from '../../types/response/BookingResponseDTO';
import { API_BASE_URL } from '../../constants/ApiConst';
import { UI_CONSTANTS, PRICING } from '../../constants/BookingConst';
import { RouteConst } from '../../constants/RouteConst';
import defaultPoster from '../../assets/img/avatar.png';
import defaultLogo from '../../assets/img/bg-logo-cinema.png';
import cashIcon from '../../assets/img/cash-icon.png';
import momoIcon from '../../assets/img/momo-icon.png';
import './styles/movie.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import axios from 'axios';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BookingConfirmationProps {
  movieId: string;
  scheduleId: string;
  seatIds: string[];
  onConfirm: () => void;
  movieTitle?: string;
  posterUrl?: string;
  scheduleShowtime?: string;
  schedulePrice?: number;
  scheduleTheaterId?: string;
  scheduleRoomId?: string;
}

function decodeCookieValue(value?: string) {
  if (!value) return '';
  return decodeURIComponent(value.replace(/\+/g, ' '));
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  movieId,
  scheduleId,
  seatIds,
  onConfirm,
  movieTitle,
  posterUrl,
  scheduleShowtime,
  schedulePrice,
  scheduleTheaterId,
  scheduleRoomId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingResponseDTO[]>([]);
  const [movie, setMovie] = useState<MovieResponseDTO | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResponseDTO | null>(null);
  const [seats, setSeats] = useState<ScheduleSeatResponseDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [isTheaterFlow, setIsTheaterFlow] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  const userName = decodeCookieValue(Cookies.get('fullName')) || 'Anonymous Customer';
  const userAddress = decodeCookieValue(Cookies.get('userAddress')) || 'Address Not Specified';
  const userId = Cookies.get('userId');

  useEffect(() => {
    if (!userId) {
      navigate(RouteConst.LOGIN);
      return;
    }

    console.log('BookingConfirmation props:', {
      movieId,
      scheduleId,
      seatIds,
      movieTitle,
      posterUrl,
      scheduleShowtime,
      schedulePrice,
      scheduleTheaterId,
      scheduleRoomId,
    });

    const fetchMovie = async () => {
      if (!movieId && movieTitle) {
        return { movieId: '', title: movieTitle, posterUrl: posterUrl || defaultPoster } as MovieResponseDTO;
      }
      try {
        const response = await getMovieById(movieId);
        console.log('Movie response:', response);
        return {
          ...response,
          posterUrl: response.posterUrl ? `${API_BASE_URL}${response.posterUrl}` : defaultPoster,
        } as MovieResponseDTO;
      } catch (err: any) {
        console.error('Movie API error:', {
          status: err.response?.status,
          message: err.message,
          data: err.response?.data,
          url: `${API_BASE_URL}/api/book/v1/movie/${movieId}`,
        });
        return null;
      }
    };

    const fetchSchedule = async () => {
      try {
        const response = await getScheduleById(scheduleId);
        console.log('Schedule response:', response);
        return response as ScheduleResponseDTO;
      } catch (err: any) {
        console.error('Schedule API error:', {
          status: err.response?.status,
          message: err.message,
          data: err.response?.data,
          url: `${API_BASE_URL}/api/book/v1/schedule/id/${scheduleId}`,
        });
        return null;
      }
    };

    const fetchSeats = async () => {
      try {
        const response = await getSeatsBySchedule(scheduleId);
        console.log('Seats response:', response);
        return response as ScheduleSeatResponseDTO[];
      } catch (err: any) {
        console.error('Seats API error:', {
          status: err.response?.status,
          message: err.message,
          data: err.response?.data,
          url: `${API_BASE_URL}/api/book/v1/seats/${scheduleId}`,
        });
        return [];
      }
    };

    const fetchDetails = async () => {
      try {
        setDataLoading(true);
        console.log('Fetching details for:', { movieId, scheduleId });

        setIsTheaterFlow(!!movieTitle && !movieId && !!scheduleId);

        const [movieData, scheduleData, seatsData] = await Promise.all([fetchMovie(), fetchSchedule(), fetchSeats()]);

        const hasMovieData = movieData || (movieTitle && posterUrl);
        const hasScheduleData = scheduleData || (scheduleShowtime && schedulePrice && scheduleTheaterId && scheduleRoomId);

        if (!hasMovieData && !hasScheduleData) {
          throw new Error(t('booking.errors.missingDetails'));
        }

        setMovie(
          movieData ||
          (movieTitle
            ? { movieId: '', title: movieTitle, posterUrl: posterUrl || defaultPoster } as MovieResponseDTO
            : { movieId: '', title: 'Unknown Movie', posterUrl: posterUrl || defaultPoster } as MovieResponseDTO)
        );
        setSchedule(
          scheduleData || {
            scheduleId: scheduleId,
            movieId: '',
            roomId: scheduleRoomId || 'N/A',
            theaterId: scheduleTheaterId || 'N/A',
            showtime: scheduleShowtime || 'N/A',
            price: schedulePrice || 0,
            totalSeats: 0,
            availableSeats: 0,
          } as ScheduleResponseDTO
        );
        setSeats(seatsData);
        setError(hasMovieData && hasScheduleData ? null : 'Partial data loaded. Some details may be unavailable.');
      } catch (error: any) {
        console.error('Error fetching details:', error.message || error);
        setError(error.message || t('booking.errors.loadingFailed'));
      } finally {
        setDataLoading(false);
      }
    };

    if (scheduleId) {
      fetchDetails();
    } else {
      setError('Invalid movie or schedule ID.');
      setDataLoading(false);
    }
  }, [movieId, scheduleId, movieTitle, posterUrl, scheduleShowtime, schedulePrice, scheduleTheaterId, scheduleRoomId, navigate, userId, t]);

  const confirmBookingHandler = async () => {
    try {
      setLoading(true);
      console.log('Confirming booking for seats:', seatIds);
      if (!userId || !scheduleId || seatIds.length === 0) {
        throw new Error(t('booking.errors.missingDetails'));
      }

      const bookingRequest = { 
        userId, 
        scheduleId, 
        seatIds, 
        promotionId: null 
      };

      if (paymentMethod === 'momo') {
        const response = await axios.post(`${API_BASE_URL}/api/book/v1/momo/initiate`, bookingRequest, {
          params: { totalAmount: totalPrice },
          withCredentials: true
        });
        window.location.href = response.data.payUrl;
      } else {
        const response = await confirmBooking(bookingRequest);
        console.log('Booking responses:', response);
        setBookings(response);
        setError(null);
        
        setTimeout(() => {
          navigate(RouteConst.BOOKING_SUCCESS, {
            state: {
              bookings: response,
              movieTitle: movie?.title || movieTitle || 'Unknown Movie',
              posterUrl: movie?.posterUrl || posterUrl || defaultPoster,
            },
          });
          onConfirm();
        }, UI_CONSTANTS.LOADING_DELAY);
      }
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      const errorMessage = error.response?.data
        ? typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data)
        : error.message || t('booking.errors.bookingFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const ticketPrice = schedule?.price || schedulePrice || bookings[0]?.price || 0;
  const seatPrices = seatIds.map(seatId => {
    const seat = seats.find(s => s.scheduleSeatId === seatId);
    return seat?.seatType === 'VIP' ? ticketPrice + PRICING.VIP_SURCHARGE : ticketPrice;
  });
  const totalPrice = seatPrices.reduce((sum, price) => sum + price, 0);

  const movieImage = movie?.posterUrl || posterUrl || defaultPoster;

  const orderDate = dayjs().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY hh:mm A [+0700]');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 bg-white shadow-lg relative">
      <div className="bg-[#00B14F] text-white p-4 rounded-t-lg flex items-center">
        <img
          className="logo"
          src={defaultLogo}
          alt="Star Theater logo"
          height={50}
          width={100}
        />
        <div>
          <h1 className="text-xl font-bold">{t('booking.confirmation.title')}</h1>
          <p className="text-sm">{t('booking.confirmation.total')}: <span className="font-semibold">{totalPrice} VND</span></p>
          <p className="text-xs">{t('booking.confirmation.orderTime')}: {orderDate}</p>
        </div>
      </div>
      <div className="p-4 border border-gray-200 rounded-b-lg">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="text-white text-center text-sm mt-4">{t('booking.confirmation.processing')}</p>
          </div>
        )}
        {error && <p className="text-[#b91c1c] text-center text-sm font-medium">{error}</p>}
        {dataLoading && !error && (
          <p className="text-gray-600 text-center text-sm animate-pulse">{t('booking.confirmation.loadingDetails')}</p>
        )}
        {!dataLoading && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <img
                src={movieImage}
                alt={movie?.title || movieTitle || 'Movie Poster'}
                className="w-full h-[300px] object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.src = defaultPoster;
                }}
              />
            </div>
            <div className="md:w-2/3">
              <h2 className="text-lg font-semibold text-[#00B14F]">{t('booking.confirmation.bookingDetails')}</h2>
              <p className="text-gray-600 mt-2">{t('booking.confirmation.movieTicketInfo')}</p>
              <div className="mt-2 space-y-1">
                <p><strong>{t('booking.confirmation.bookedBy')}:</strong> {userName}</p>
                <p><strong>{t('booking.confirmation.movie')}:</strong> {movie?.title || movieTitle || 'Unknown Movie'}</p>
                <p><strong>{t('booking.confirmation.showtime')}:</strong> {schedule?.showtime
                  ? dayjs(schedule.showtime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY hh:mm A')
                  : scheduleShowtime
                  ? dayjs(scheduleShowtime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY hh:mm A')
                  : 'N/A'}</p>
                <p><strong>{t('booking.confirmation.theater')}:</strong> {schedule?.theaterId || scheduleTheaterId || 'N/A'}</p>
                <p><strong>{t('booking.confirmation.room')}:</strong> {schedule?.roomId || scheduleRoomId || 'N/A'}</p>
                <p><strong>{t('booking.confirmation.seats')}:</strong> {seatIds.length > 0 ? seatIds.join(', ') : t('booking.confirmation.noSeatsSelected')}</p>
              </div>
              <div className="relative mt-6">
                <div className="dashed-line"></div>            
                <div className="pt-4">
                  <p className="font-semibold">{t('booking.confirmation.paymentMethod')}:</p>
                  <div className="flex flex-col gap-4 mt-2">
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${paymentMethod === 'cash' ? 'border-[#00B14F] bg-green-50' : 'border-gray-300 hover:border-[#00B14F]'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3 h-5 w-5 text-[#00B14F] focus:ring-[#00B14F]"
                      />
                      <img src={cashIcon} alt="Cash" className="w-8 h-8 mr-3" />
                      <span className="text-gray-700">{t('booking.confirmation.cash')}</span>
                    </label>
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${paymentMethod === 'momo' ? 'border-[#00B14F] bg-green-50' : 'border-gray-300 hover:border-[#00B14F]'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="momo"
                        checked={paymentMethod === 'momo'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3 h-5 w-5 text-[#00B14F] focus:ring-[#00B14F]"
                      />
                      <img src={momoIcon} alt="MoMo" className="w-8 h-8 mr-3" />
                      <span className="text-gray-700">{t('booking.confirmation.momo')}</span>
                    </label>
                  </div>
                  <p className="mt-4 font-semibold">{t('booking.confirmation.ticketDetails')}</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {seatIds.map((seatId, index) => {
                      const seat = seats.find(s => s.scheduleSeatId === seatId);
                      const price = seat?.seatType === 'VIP' ? ticketPrice + PRICING.VIP_SURCHARGE : ticketPrice;
                      return (
                        <li key={seatId}>
                          {t('booking.confirmation.ticket')} #{index + 1}: Seat {seatId} ({seat?.seatType || 'Unknown'}) - {price} VND
                        </li>
                      );
                    })}
                    <li>{t('booking.confirmation.total')} <span className="float-right">{totalPrice} VND</span></li>
                  </ul>
                  <p className="mt-2 text-right font-bold">{t('booking.confirmation.totalPrice')}: {totalPrice} VND</p>
                </div>
              </div>
              <button
                className="btn-ticket mt-6 w-full"
                onClick={confirmBookingHandler}
                disabled={seatIds.length === 0 || loading || dataLoading}
              >
                {t('booking.confirmation.confirmBooking')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation;