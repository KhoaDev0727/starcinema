import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Input, Button, Dropdown, Menu, Typography } from 'antd';
import { SearchOutlined, DownOutlined, UpOutlined, EditOutlined, DeleteOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import type { Movie } from '../types';
import AddMovieModal from './AddMovieModal';
import UpdateMovieModal from './UpdateMovieModal';
import MOVIE_ADMIN_CONSTANTS from '../../constants/MovieAdminConst';
import './MovieAdminStyles/MoviesAdminStyles.scss';

const { Title } = Typography;

interface MoviesAdminProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  moviesPerPage: number;
  totalPages: number;
  newMovie: Partial<Movie>;
  setNewMovie: (movie: Partial<Movie>) => void;
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
  onAddMovie: (values: Partial<Movie>) => Promise<boolean>;
  onUpdateMovie: (values: Movie) => Promise<boolean>;
  onDeleteMovie: (movieId: string, movieTitle: string) => void;
}

const MoviesAdmin: React.FC<MoviesAdminProps> = ({
  movies,
  loading,
  error,
  setError,
  searchTerm,
  setSearchTerm,
  selectedGenre,
  setSelectedGenre,
  currentPage,
  setCurrentPage,
  moviesPerPage,
  totalPages,
  newMovie,
  setNewMovie,
  selectedMovie,
  setSelectedMovie,
  onAddMovie,
  onUpdateMovie,
  onDeleteMovie,
}) => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const genres = Object.values(MOVIE_ADMIN_CONSTANTS.GENRES).map((genre) => ({
    key: genre,
    label: t(`movieAdmin.filter.genres.${genre.toLowerCase()}`, { defaultValue: genre }),
  }));

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  const clearFilter = () => {
    setSelectedGenre('');
    setCurrentPage(1);
  };

  const toggleAddModal = () => {
    setIsAddModalOpen((prev) => !prev);
    setNewMovie(MOVIE_ADMIN_CONSTANTS.DEFAULT_VALUES.NEW_MOVIE);
    setError(null);
  };

  const toggleUpdateModal = useCallback((movie?: Movie) => {
    console.log('Opening update modal for movie:', movie);
    setIsUpdateModalOpen((prev) => !prev);
    if (movie && movie.movieId) {
      const selectedMovieData = {
        ...movie,
        posterUrl: movie.posterUrl?.startsWith(MOVIE_ADMIN_CONSTANTS.URLS.LOCALHOST_8080)
          ? movie.posterUrl.replace(MOVIE_ADMIN_CONSTANTS.URLS.LOCALHOST_8080, '')
          : movie.posterUrl || '',
      };
      console.log('Setting selected movie:', selectedMovieData);
      setSelectedMovie(selectedMovieData);
    } else {
      setSelectedMovie(null);
    }
    setError(null);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrollButtonVisible(window.scrollY > MOVIE_ADMIN_CONSTANTS.PAGINATION.SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = (to: 'top' | 'bottom') => {
    if (to === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  const filteredMovies = movies.filter((movie) =>
    Object.values(movie).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) && (!selectedGenre || movie.genre === selectedGenre)
  );

  const columns: ColumnsType<Movie> = [
    {
      title: t('movieAdmin.table.image'),
      dataIndex: 'posterUrl',
      render: (posterUrl) => (
        <img
          src={posterUrl || MOVIE_ADMIN_CONSTANTS.DEFAULT_VALUES.DEFAULT_POSTER}
          alt="poster"
          className="movie-poster"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = MOVIE_ADMIN_CONSTANTS.DEFAULT_VALUES.DEFAULT_POSTER;
          }}
        />
      ),
    },
    { title: t('movieAdmin.table.name'), dataIndex: 'title' },
    {
      title: t('movieAdmin.table.description'),
      dataIndex: 'shortDescription',
      render: (shortDescription, record) => shortDescription || record.description,
    },
    { title: t('movieAdmin.table.genre'), dataIndex: 'genre' },
    {
      title: t('movieAdmin.table.action'),
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="link"
            onClick={() => toggleUpdateModal(record)}
            icon={<EditOutlined />}
            className="action-button"
          >
            {t('movieAdmin.table.edit', { defaultValue: 'Edit' })}
          </Button>
          <Button
            type="link"
            danger
            onClick={() => onDeleteMovie(record.movieId!, record.title)}
            icon={<DeleteOutlined />}
            className="action-button"
          >
            {t('movieAdmin.table.delete', { defaultValue: 'Delete' })}
          </Button>
        </div>
      ),
    },
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: 'all',
      label: t('movieAdmin.filter.allGenres'),
      onClick: clearFilter,
    },
    ...genres.map((genre) => ({
      key: genre.key,
      label: genre.label,
      onClick: () => handleGenreSelect(genre.key),
    })),
  ];

  return (
    <div className="movies-admin-container" style={{ overflow: 'visible' }}>
      <Title level={2} className="movies-admin-title">
        {t('movieAdmin.title')}
      </Title>
      <div className="movies-admin-search">
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('movieAdmin.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="button-group">
          <Dropdown menu={{ items: menuItems }}>
            <Button icon={<FilterOutlined />} className="filter-button">
              {t('movieAdmin.filter.filter', { defaultValue: 'Filter' })}
            </Button>
          </Dropdown>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="add-movie-button"
            onClick={toggleAddModal}
          >
            {t('movieAdmin.addMovie', { defaultValue: 'Add Movie' })}
          </Button>
        </div>
      </div>
      {loading ? (
        <p>{t('movieAdmin.loading')}</p>
      ) : error ? (
        <p className="error-message">{t('movieAdmin.error', { message: error })}</p>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredMovies}
          rowKey="movieId"
          pagination={{
            current: currentPage,
            total: filteredMovies.length,
            pageSize: moviesPerPage,
            onChange: (page) => setCurrentPage(page),
          }}
          bordered
          className="movies-table"
        />
      )}
      {isScrollButtonVisible && (
        <div className="scroll-buttons">
          <motion.button
            className="scroll-button scroll-top"
            onClick={() => handleScroll('top')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button shape="circle" icon={<UpOutlined />} />
          </motion.button>
          <motion.button
            className="scroll-button scroll-bottom"
            onClick={() => handleScroll('bottom')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button shape="circle" icon={<DownOutlined />} />
          </motion.button>
        </div>
      )}
      <AddMovieModal
        isOpen={isAddModalOpen}
        genres={Object.values(MOVIE_ADMIN_CONSTANTS.GENRES)}
        onClose={toggleAddModal}
        onSubmit={onAddMovie}
      />
      <UpdateMovieModal
        key={selectedMovie?.movieId || 'no-movie'}
        isOpen={isUpdateModalOpen}
        movie={selectedMovie}
        genres={Object.values(MOVIE_ADMIN_CONSTANTS.GENRES)}
        onClose={toggleUpdateModal}
        onSubmit={onUpdateMovie}
      />
    </div>
  );
};

export default MoviesAdmin;