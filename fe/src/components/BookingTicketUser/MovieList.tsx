// src/components/MovieList.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Tag, Button, Space, Typography, Divider, Spin } from 'antd';
import { HeartOutlined, PlayCircleOutlined, ClockCircleOutlined, CalendarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { getMovieList } from '../../services/BookingService';
import type { MovieResponseDTO } from '../../types/response/BookingResponseDTO';
import { API_BASE_URL } from '../../constants/ApiConst';
import defaultPoster from '../../assets/img/avatar.png';

const { Text, Title } = Typography;

interface MovieListProps {
  onSelectMovie: (movieId: string, title: string, posterUrl?: string) => void;
}

const MovieList: React.FC<MovieListProps> = ({ onSelectMovie }) => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState<MovieResponseDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleMovies, setVisibleMovies] = useState<number>(0);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await getMovieList();
        const moviesWithPosters = response.map((movie: MovieResponseDTO) => ({
          ...movie,
          posterUrl: movie.posterUrl 
            ? `${API_BASE_URL}${movie.posterUrl}` 
            : defaultPoster,
        }));
        setMovies(moviesWithPosters);
        setError(null);
      } catch (error) {
        console.error('Error loading movie list:', error);
        setError(t('booking.errors.loadingFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [t]);

  useEffect(() => {
    if (!loading && filteredMovies.length > 0) {
      // Animate movies appearing one by one
      const timer = setTimeout(() => {
        setVisibleMovies(filteredMovies.length);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setVisibleMovies(0);
    }
  }, [loading, filteredMovies.length]);

  const getRatingColor = (ratingLabel: string) => {
    switch (ratingLabel) {
      case 'P':
        return 'green';
      case 'T18':
        return 'red';
      default:
        return 'orange';
    }
  };

  const getRatingText = (ratingLabel: string) => {
    switch (ratingLabel) {
      case 'P':
        return 'P - Phổ thông';
      case 'T18':
        return 'T18 - 18+';
      default:
        return ratingLabel;
    }
  };

  return (
    <main className="max-w-[960px] mx-auto px-4 pb-10">
      <div className="header-main">
        <h1 className="text-xl font-normal m-0">{t('booking.movieList.title')}</h1>
        <div className="header-right">
          <div className="movie-search-compact">
            <input
              type="text"
              className="movie-search-input-compact"
              placeholder={t('booking.movieList.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              aria-label={t('booking.movieList.searchPlaceholder')}
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          <a href="#" className="text-[13px] font-normal text-[#666666] no-underline hover:underline">
            {t('booking.movieList.comingSoon')}
          </a>
        </div>
      </div>
      <hr className="border-t border-black mb-6" />
      
      {loading && (
        <div className="loading-container">
          <Spin size="large" />
          <p className="text-[#666666] text-center mt-4 animate-pulse">
            {t('booking.movieList.loading')}
          </p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p className="text-red-600 text-center font-medium">{error}</p>
        </div>
      )}
      
      {!loading && movies.length === 0 && !error && (
        <div className="empty-container">
          <p className="text-[#666666] text-center">{t('booking.movieList.noMovies')}</p>
        </div>
      )}
      
      <Row gutter={[24, 32]} className="movies-row">
        {filteredMovies.map((movie, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={movie.movieId}>
            <div 
              className={`movie-card-wrapper ${index < visibleMovies ? 'fade-in' : 'fade-out'}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                opacity: index < visibleMovies ? 1 : 0,
                transform: index < visibleMovies ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <Card
                hoverable
                className="movie-card"
                cover={
                  <div style={{ position: 'relative', height: 320 }}>
                    <img
                      alt={movie.title}
                      src={movie.posterUrl}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        e.currentTarget.src = defaultPoster;
                      }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      top: 12, 
                      left: 12, 
                      zIndex: 1 
                    }}>
                      {movie.ratingLabel && (
                        <Tag color={getRatingColor(movie.ratingLabel)} style={{ margin: 0, fontWeight: 'bold' }}>
                          {getRatingText(movie.ratingLabel)}
                        </Tag>
                      )}
                    </div>
                    {movie.ranking && (
                      <div style={{ 
                        position: 'absolute', 
                        top: 12, 
                        right: 12, 
                        zIndex: 1 
                      }}>
                        <Tag color="red" style={{ 
                          margin: 0, 
                          borderRadius: '50%', 
                          width: 36, 
                          height: 36, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: '2px solid white'
                        }}>
                          {movie.ranking}
                        </Tag>
                      </div>
                    )}
                  </div>
                }
                bodyStyle={{ padding: '20px' }}
              >
                <Title level={4} style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '16px',
                  lineHeight: '1.4',
                  height: '44px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {movie.title}
                </Title>
                
                <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlayCircleOutlined style={{ color: '#d91c0f', fontSize: '14px' }} />
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      {movie.genre}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ClockCircleOutlined style={{ color: '#d91c0f', fontSize: '14px' }} />
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      {movie.duration} {t('booking.movieList.minutes')}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: '#d91c0f', fontSize: '14px' }} />
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      {new Date(movie.releaseDate).toLocaleDateString('en-GB')}
                    </Text>
                  </div>
                </Space>
                
                <Divider style={{ margin: '16px 0' }} />
                
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Button 
                    type="text" 
                    size="middle" 
                    icon={<HeartOutlined />}
                    style={{ color: '#666', fontSize: '13px' }}
                  >
                    {movie.likes || 0}
                  </Button>
                  <Button 
                    type="primary" 
                    size="middle"
                    danger
                    icon={<ShoppingCartOutlined />}
                    onClick={() => onSelectMovie(movie.movieId, movie.title, movie.posterUrl)}
                    style={{ 
                      background: '#d91c0f', 
                      borderColor: '#d91c0f',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      height: '36px',
                      padding: '0 16px'
                    }}
                  >
                    {t('booking.movieList.buyTicket')}
                  </Button>
                </Space>
              </Card>
            </div>
          </Col>
        ))}
      </Row>
    </main>
  );
};

export default MovieList;
