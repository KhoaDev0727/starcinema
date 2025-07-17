import React, { useState } from 'react';
import { useOAuthRedirect } from '../../hooks/useOAuthRedirect';
import Header from './Header';
import MovieList from '../BookingTicketUser/MovieList';
import ShowtimeSelection from '../BookingTicketUser/ShowtimeSelection';
import SeatSelection from '../BookingTicketUser/SeatSelection';
import BookingConfirmation from '../BookingTicketUser/BookingConfirmation';
import MyBookings from '../AccountManagement/MyBookings';
import LocationList from '../TheatherManagement/LocationList';
import Footer from './Footer';
import EditProfileForm from '../Auth/EditProfileForm';
import ChangePassword from '../Auth/ChangePassword';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import ScoreHistory from '../Score/ScoreHistory';

const Home: React.FC = () => {
  useOAuthRedirect();
  const { t } = useTranslation();

  const [step, setStep] = useState<'movies' | 'showtimes' | 'seats' | 'confirm' | 'mybookings' | 'theaters' | 'editProfile' | 'changePassword' | 'profile' | 'home' | 'score'>('movies');
  const [selectedMovie, setSelectedMovie] = useState<{
    movieId: string;
    title: string;
    posterUrl?: string;
  } | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<{
    scheduleId: string;
    showtime: string;
    price: number;
    theaterId: string;
    roomId: string;
    movieTitle?: string;
    posterUrl?: string; // Đảm bảo nhận posterUrl
  } | null>(null);
  const [selectedTheater, setSelectedTheater] = useState<{
    theaterId: string;
    theaterName: string;
  } | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSelectMovie = (movieId: string, title: string, posterUrl?: string) => {
    setSelectedMovie({ movieId, title, posterUrl });
    setSelectedTheater(null);
    setSelectedSchedule(null);
    setSelectedSeatIds([]);
    setStep('showtimes');
    setError(null);
  };

  const handleSelectTheater = (theaterId: string, theaterName: string) => {
    setSelectedTheater({ theaterId, theaterName });
    setSelectedMovie(null);
    setSelectedSchedule(null);
    setSelectedSeatIds([]);
    setStep('showtimes');
    setError(null);
  };

  const handleSelectSchedule = (schedule: {
    scheduleId: string;
    showtime: string;
    price: number;
    theaterId: string;
    roomId: string;
    movieTitle?: string;
    posterUrl?: string;
  }) => {
    console.log('Selected schedule with posterUrl:', schedule.posterUrl); // Log để kiểm tra
    setSelectedSchedule(schedule);
    setSelectedSeatIds([]);
    setStep('seats');
    setError(null);
  };

  const handleSelectSeats = (seatIds: string[]) => {
    setSelectedSeatIds(seatIds);
  };

  const handleProceed = () => {
    setStep('confirm');
    setError(null);
  };

  const handleConfirm = () => {
    setStep('movies');
    setSelectedMovie(null);
    setSelectedSchedule(null);
    setSelectedTheater(null);
    setSelectedSeatIds([]);
    setError(null);
  };

  const handleStepChange = (newStep: 'movies' | 'showtimes' | 'seats' | 'confirm' | 'mybookings' | 'theaters' | 'editProfile' | 'changePassword' | 'profile' | 'home' | 'score') => {
    setStep(newStep);
    if (newStep === 'movies') {
      setSelectedTheater(null);
      setSelectedMovie(null);
      setSelectedSchedule(null);
      setSelectedSeatIds([]);
    } else if (newStep === 'theaters') {
      setSelectedTheater(null);
      setSelectedMovie(null);
      setSelectedSchedule(null);
      setSelectedSeatIds([]);
    } else if (newStep === 'showtimes' && (selectedMovie || selectedTheater)) {
      setSelectedSchedule(null);
      setSelectedSeatIds([]);
    } else if (newStep === 'seats' && selectedSchedule) {
      setSelectedSeatIds([]);
    }
    setError(null);
  };

  const breadcrumbText = {
    home: 'breadcrumb.home',
    theaters: 'breadcrumb.theaters',
    movies: 'breadcrumb.movies',
    showtimes: 'breadcrumb.showtimes',
    seats: 'breadcrumb.seats',
    confirm: 'breadcrumb.confirm',
    mybookings: 'breadcrumb.mybookings',
    profile: 'breadcrumb.profile',
    editProfile: 'breadcrumb.editProfile',
    changePassword: 'breadcrumb.changePassword',
    score: 'header.score',
  };

  type StepType = 'movies' | 'showtimes' | 'seats' | 'confirm' | 'mybookings' | 'theaters' | 'editProfile' | 'changePassword' | 'profile' | 'home' | 'score';
  type BreadcrumbItem = {
    text: string;
    step: StepType;
    onClick?: () => void;
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      text: breadcrumbText.home,
      step: 'home',
      onClick: () => handleStepChange('movies'),
    },
  ];

  if (step === 'editProfile' || step === 'changePassword' || step === 'profile') {
    breadcrumbs.push({
      text: breadcrumbText.profile,
      step: 'profile',
      onClick: () => setStep('profile'),
    });
    if (step === 'editProfile') {
      breadcrumbs.push({
        text: breadcrumbText.editProfile,
        step: 'editProfile',
      });
    }
    if (step === 'changePassword') {
      breadcrumbs.push({
        text: breadcrumbText.changePassword,
        step: 'changePassword',
      });
    }
  } else {
    if (step === 'movies' || step === 'theaters' || step === 'showtimes' || step === 'seats' || step === 'confirm') {
      breadcrumbs.push({
        text: breadcrumbText.movies,
        step: 'movies',
        onClick: () => handleStepChange('movies'),
      });
    }
    if (step === 'theaters' || step === 'showtimes' || step === 'seats' || step === 'confirm') {
      breadcrumbs.push({
        text: breadcrumbText.theaters,
        step: 'theaters',
        onClick: () => handleStepChange('theaters'),
      });
    }
    if (step === 'showtimes' || step === 'seats' || step === 'confirm') {
      breadcrumbs.push({
        text: breadcrumbText.showtimes,
        step: 'showtimes',
        onClick: selectedMovie || selectedTheater ? () => handleStepChange('showtimes') : undefined,
      });
    }
    if (step === 'seats' || step === 'confirm') {
      breadcrumbs.push({
        text: breadcrumbText.seats,
        step: 'seats',
        onClick: selectedSchedule ? () => handleStepChange('seats') : undefined,
      });
    }
    if (step === 'confirm') {
      breadcrumbs.push({
        text: breadcrumbText.confirm,
        step: 'confirm',
      });
    }
    if (step === 'mybookings') {
      breadcrumbs.push({
        text: breadcrumbText.mybookings,
        step: 'mybookings',
      });
    }
    if (step === 'score') {
      breadcrumbs.push({
        text: breadcrumbText.score,
        step: 'score',
        onClick: () => setStep('score'),
      });
    }
  }

  return (
    <>
      <Header
        breadcrumbs={breadcrumbs}
        onStepChange={handleStepChange}
        onEditProfile={() => setStep('editProfile')}
        onChangePassword={() => setStep('changePassword')}
      />
      <div className="page-transition" key={step}>
        {error && <div className="error-message">{error}</div>}
        {step === 'theaters' && <LocationList onSelectTheater={handleSelectTheater} />}
        {step === 'movies' && (
          <MovieList
            onSelectMovie={(movieId, title, posterUrl) => handleSelectMovie(movieId, title, posterUrl)}
          />
        )}
        {step === 'showtimes' && (selectedMovie || selectedTheater) && (
          <ShowtimeSelection
            movieId={selectedMovie?.movieId}
            movieTitle={selectedMovie?.title}
            posterUrl={selectedMovie?.posterUrl}
            theaterId={selectedTheater?.theaterId}
            theaterName={selectedTheater?.theaterName}
            onSelectSchedule={handleSelectSchedule}
          />
        )}
        {step === 'seats' && selectedSchedule && (
          <SeatSelection
            scheduleId={selectedSchedule.scheduleId}
            onSelectSeats={handleSelectSeats}
            onProceed={handleProceed}
          />
        )}
        {step === 'confirm' && selectedSchedule && (
          <BookingConfirmation
            movieId={selectedMovie?.movieId || ''}
            scheduleId={selectedSchedule.scheduleId}
            seatIds={selectedSeatIds}
            onConfirm={handleConfirm}
            movieTitle={selectedSchedule.movieTitle || selectedMovie?.title || 'Unknown Movie'}
            posterUrl={selectedSchedule.posterUrl || selectedMovie?.posterUrl}
            scheduleShowtime={selectedSchedule.showtime}
            schedulePrice={selectedSchedule.price}
            scheduleTheaterId={selectedSchedule.theaterId}
            scheduleRoomId={selectedSchedule.roomId}
          />
        )}
        {step === 'mybookings' && <MyBookings />}
        {step === 'editProfile' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh', padding: '32px 0' }}>
            <div style={{ width: '100%', maxWidth: 600, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 32 }}>
              <EditProfileForm />
            </div>
          </div>
        )}
        {step === 'changePassword' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh', padding: '32px 0' }}>
            <div style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 32 }}>
              <div className="change-password-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <span style={{ fontSize: 32, color: '#d32f2f', marginRight: 12 }}>🔒</span>
                <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#d32f2f', textAlign: 'center', letterSpacing: 1 }}>{t('auth.changePassword.title')}</h2>
              </div>
              <ChangePassword />
            </div>
          </div>
        )}
        {step === 'score' && <ScoreHistory />}
      </div>
      <Footer />
    </>
  );
};

export default Home;