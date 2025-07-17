import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getSchedulesByMovie, getSchedulesByTheater, getMovieById } from '../../services/BookingService';
import type { ScheduleResponseDTO } from '../../types/response/BookingResponseDTO';
import { API_BASE_URL } from '../../constants/ApiConst';
import { DATE_SELECTION } from '../../constants/BookingConst';
import defaultPoster from "../../assets/img/avatar.png";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with utc and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

interface ShowtimeSelectionProps {
  movieId?: string;
  movieTitle?: string;
  posterUrl?: string;
  theaterId?: string;
  theaterName?: string;
  onSelectSchedule: (schedule: {
    scheduleId: string;
    showtime: string;
    price: number;
    theaterId: string;
    roomId: string;
    movieTitle?: string;
    posterUrl?: string;
  }) => void;
}

const ShowtimeSelection: React.FC<ShowtimeSelectionProps> = ({
  movieId,
  movieTitle,
  posterUrl,
  theaterId,
  theaterName,
  onSelectSchedule,
}) => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<ScheduleResponseDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState(dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD'));
  const [dateRangeStart, setDateRangeStart] = useState(0);
  const dateContainerRef = useRef<HTMLDivElement>(null);

  // Maximum days to allow in the date range (e.g., 3 weeks)
  const MAX_DAYS = 21;

  // Generate dates starting from dateRangeStart
  const generateDates = () => {
    const dates = [];
    const today = dayjs().tz('Asia/Ho_Chi_Minh');
    
    for (let i = dateRangeStart; i < dateRangeStart + DATE_SELECTION.DEFAULT_DAYS_AHEAD && i < MAX_DAYS; i++) {
      const date = today.add(i, 'day');
      
      dates.push({
        day: date.format('MM/DD'),
        weekday: date.format('ddd'),
        number: date.format('DD'),
        date: date.format('YYYY-MM-DD'),
      });
    }
    
    return dates;
  };

  const dates = generateDates();

  // Scroll functions for date navigation and update selectedDate
  const scrollLeft = () => {
    if (dateContainerRef.current) {
      dateContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      const currentIndex = dates.findIndex(d => d.date === selectedDate);
      if (currentIndex > 0) {
        setSelectedDate(dates[currentIndex - 1].date);
      } else if (dateRangeStart > 0) {
        // Shift the date range backward
        setDateRangeStart(prev => Math.max(prev - 1, 0));
        setSelectedDate(dayjs().tz('Asia/Ho_Chi_Minh').add(dateRangeStart - 1, 'day').format('YYYY-MM-DD'));
      }
    }
  };

  const scrollRight = () => {
    if (dateContainerRef.current) {
      dateContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      const currentIndex = dates.findIndex(d => d.date === selectedDate);
      if (currentIndex < dates.length - 1) {
        setSelectedDate(dates[currentIndex + 1].date);
      } else if (dateRangeStart + DATE_SELECTION.DEFAULT_DAYS_AHEAD < MAX_DAYS) {
        // Shift the date range forward
        setDateRangeStart(prev => prev + 1);
        setSelectedDate(dayjs().tz('Asia/Ho_Chi_Minh').add(dateRangeStart + DATE_SELECTION.DEFAULT_DAYS_AHEAD, 'day').format('YYYY-MM-DD'));
      }
    }
  };

  useEffect(() => {
    console.log('ShowtimeSelection props:', { movieId, movieTitle, posterUrl, theaterId, theaterName });
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        let response: ScheduleResponseDTO[] = [];

        if (theaterId) {
          response = await getSchedulesByTheater(theaterId);
        } else if (movieId) {
          response = await getSchedulesByMovie(movieId);
        } else {
          throw new Error('No movie or theater selected.');
        }

        const schedulesWithPosters = await Promise.all(
          response.map(async (schedule: ScheduleResponseDTO) => {
            console.log('Raw schedule data:', schedule);
            let fullPosterUrl = defaultPoster;
            
            if (!schedule.posterUrl && schedule.movieId) {
              try {
                const movieData = await getMovieById(schedule.movieId);
                fullPosterUrl = movieData.posterUrl
                  ? movieData.posterUrl.startsWith('http')
                    ? movieData.posterUrl
                    : `${API_BASE_URL}${movieData.posterUrl}`
                  : defaultPoster;
              } catch (movieError) {
                console.error('Error fetching movie poster:', movieError);
              }
            } else if (schedule.posterUrl) {
              fullPosterUrl = schedule.posterUrl.startsWith('http')
                ? schedule.posterUrl
                : `${API_BASE_URL}${schedule.posterUrl}`;
            }
            
            console.log('Constructed posterUrl:', fullPosterUrl);
            return {
              ...schedule,
              posterUrl: fullPosterUrl,
            };
          })
        );
        
        setSchedules(schedulesWithPosters);
        setError(null);
      } catch (error: any) {
        console.error('Error loading schedules:', error);
        setError(t('booking.errors.loadingFailed'));
      } finally {
        setLoading(false);
      }
    };

    if (movieId || theaterId) {
      fetchSchedules();
    } else {
      setError('No movie or theater selected.');
      setLoading(false);
    }
  }, [movieId, theaterId, t]);

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = dayjs(schedule.showtime).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(schedule);
    return acc;
  }, {} as { [key: string]: ScheduleResponseDTO[] });

  return (
    <main
      className="max-w-5xl mx-auto px-4 py-4 bg-[#f9f8e9] text-[#1a1a00]"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <nav className="flex items-center justify-between mb-4">
        <button
          className="bg-[#f9f8e9] border border-[#c9c6b0] text-[#1a1a00] text-[12px] font-normal px-3 py-1 leading-5 hover:bg-[#f5a623] hover:text-[#3b2a00] transition"
          onClick={scrollLeft}
        >
          ←
        </button>
        <div
          ref={dateContainerRef}
          className="flex overflow-x-auto scrollbar-hide space-x-2"
          style={{ scrollBehavior: 'smooth', maxWidth: 'calc(100% - 100px)' }}
        >
          {dates.map((d) => (
            <div
              key={d.date}
              className={`flex flex-col items-center px-3 py-1 cursor-pointer text-[13px] font-normal leading-5 min-w-[80px] ${
                selectedDate === d.date
                  ? 'bg-[#f5a623] text-[#3b2a00] font-semibold'
                  : 'bg-[#f9f8e9] border border-[#c9c6b0] text-[#1a1a00]'
              }`}
              onClick={() => setSelectedDate(d.date)}
            >
              <span className="text-[12px]">{d.weekday}</span>
              <span className="text-[14px] font-bold">{d.number}</span>
              <span className="text-[10px]">{d.day}</span>
            </div>
          ))}
        </div>
        <button
          className="bg-[#f9f8e9] border border-[#c9c6b0] text-[#1a1a00] text-[12px] font-normal px-3 py-1 leading-5 hover:bg-[#f5a623] hover:text-[#3b2a00] transition"
          onClick={scrollRight}
        >
          →
        </button>
      </nav>
      <hr className="border-t border-[#4a4a2a] mb-4" />
      <section className="movie-section">
        <h3 className="text-[16px] font-bold leading-5 tracking-wide mb-4 title-showtime">
          {theaterId 
            ? t('booking.showtime.noSchedules', { type: theaterName || 'Selected Theater' })
            : movieTitle || 'Unknown Movie'
          }
        </h3>
        {loading && (
          <p className="text-[#1a1a00] text-center text-[13px] animate-pulse">
            {t('booking.showtime.loading')}
          </p>
        )}
        {error && (
          <p className="text-red-600 text-center text-[13px] font-bold">{error}</p>
        )}
        {!loading && schedules.length === 0 && !error && (
          <p className="text-[#1a1a00] text-center text-[13px]">
            {t('booking.showtime.noSchedules', { type: theaterId ? 'theater' : 'movie' })}
          </p>
        )}
        {!loading && schedules.length > 0 && (
          <div className="flex flex-col gap-4">
            {groupedSchedules[selectedDate]?.map((schedule) => (
              <div key={schedule.scheduleId} className="flex flex-row gap-6 mb-6">
                {schedule.posterUrl && (
                  <div className="flex flex-col items-start">
                    <img
                      src={schedule.posterUrl}
                      alt={schedule.movieTitle || 'Movie Poster'}
                      className="w-[150px] h-[220px] object-cover mb-4"
                      onError={(e) => {
                        console.log('Image load error for URL:', schedule.posterUrl); 
                        e.currentTarget.src = defaultPoster;
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-[13px] mb-1">
                    {theaterId 
                      ? `${t('booking.confirmation.movie')}: ${schedule.movieTitle}` 
                      : `${t('booking.confirmation.room')}: ${schedule.roomId}`
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="bg-[#f9f8e9] border border-[#c9c6b0] text-[#1a1a00] text-[12px] font-normal px-3 py-1 leading-5 hover:bg-[#f5a623] hover:text-[#3b2a00] transition"
                      onClick={() =>
                        onSelectSchedule({
                          scheduleId: schedule.scheduleId,
                          showtime: schedule.showtime,
                          price: schedule.price,
                          theaterId: schedule.theaterId,
                          roomId: schedule.roomId,
                          movieTitle: schedule.movieTitle || movieTitle,
                          posterUrl: schedule.posterUrl,
                        })
                      }
                    >
                      {dayjs(schedule.showtime).tz('Asia/Ho_Chi_Minh').format('hh:mm A')}
                    </button>
                  </div>
                  <p className="text-[13px] font-normal leading-5">
                    {t('booking.showtime.ticketPrice')}: {schedule.price} VND
                  </p>
                  <p className="text-[13px] font-normal leading-5">
                    {t('booking.showtime.availableSeats')}: {schedule.availableSeats}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-[#1a1a00] text-center text-[13px]">
                {t('booking.showtime.noSchedulesForDate')}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default ShowtimeSelection;