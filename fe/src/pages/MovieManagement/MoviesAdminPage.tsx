import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Modal } from 'antd';
import { MoviesAdmin } from '../../components/MovieManagement';
import type { Movie } from '../../components/types';
import defaultPoster from '../../assets/img/avatar.png';
import MOVIE_ADMIN_CONSTANTS from '../../constants/MovieAdminConst';

const MoviesAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [newMovie, setNewMovie] = useState<Partial<Movie>>(MOVIE_ADMIN_CONSTANTS.DEFAULT_VALUES.NEW_MOVIE);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const moviesPerPage = MOVIE_ADMIN_CONSTANTS.PAGINATION.MOVIES_PER_PAGE;

  const fetchMovies = useCallback(async (term: string = '', genre: string = '') => {
    try {
      setLoading(true);
      let endpoint = `${MOVIE_ADMIN_CONSTANTS.API.BASE_URL}?size=1000&t=${new Date().getTime()}`;
      if (term.length >= MOVIE_ADMIN_CONSTANTS.VALIDATION.MIN_SEARCH_LENGTH || genre) {
        endpoint = `${MOVIE_ADMIN_CONSTANTS.API.BASE_URL}?size=1000&t=${new Date().getTime()}`;
        if (term) {
          endpoint += `&title=${encodeURIComponent(term)}`;
        }
        if (genre) {
          endpoint += `&genre=${encodeURIComponent(genre)}`;
        }
      }
      const response = await axios.get(endpoint, { timeout: MOVIE_ADMIN_CONSTANTS.MESSAGES.REQUEST_TIMEOUT });
      // Xử lý response mới từ Page<MovieResponse> hoặc List cũ
      let moviesData = response.data;
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        // Response mới: Page<MovieResponse>
        moviesData = response.data.content;
      } else if (response.data && Array.isArray(response.data)) {
        // Response cũ: List<MovieDTO>
        moviesData = response.data;
      } else {
        setError(t('movieAdmin.messages.invalidData'));
        return;
      }
      
      if (moviesData && Array.isArray(moviesData)) {
        const moviesWithPosters = moviesData.map((movie: Movie) => ({
          ...movie,
          posterUrl: movie.posterUrl ? `${MOVIE_ADMIN_CONSTANTS.URLS.LOCALHOST_8080}${movie.posterUrl}` : defaultPoster,
        }));
        const sortedMovies = [...moviesWithPosters].sort((a, b) => a.movieId.localeCompare(b.movieId));
        setMovies(sortedMovies);
        setError(null);
      } else {
        setError(t('movieAdmin.messages.invalidData'));
      }
    } catch (error: any) {
      console.error('Error fetching movies:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request
      });
      if (error.code === 'ECONNABORTED') {
        setError(t('movieAdmin.messages.requestTimeout'));
      } else if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else {
        setError(t('movieAdmin.messages.fetchFailed'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= MOVIE_ADMIN_CONSTANTS.VALIDATION.MIN_SEARCH_LENGTH || selectedGenre) {
        fetchMovies(searchTerm, selectedGenre);
      } else if (searchTerm.length === 0 && !selectedGenre) {
        fetchMovies();
      }
    }, MOVIE_ADMIN_CONSTANTS.VALIDATION.DEBOUNCE_DELAY);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedGenre, fetchMovies]);

  const handleAddMovie = async (values: Partial<Movie>) => {
    try {
      setLoading(true);
      if (!values.title) {
        setError(t('movieAdmin.messages.validation.titleRequired'));
        return false;
      }
      if (!values.description) {
        setError(t('movieAdmin.messages.validation.descriptionRequired'));
        return false;
      }
      if (!values.genre) {
        setError(t('movieAdmin.messages.validation.genreRequired'));
        return false;
      }
      const durationValue = values.duration;
      if (durationValue !== undefined && (isNaN(durationValue) || durationValue <= 0)) {
        setError(t('movieAdmin.messages.validation.invalidDuration'));
        return false;
      }
      if (values.releaseDate && !MOVIE_ADMIN_CONSTANTS.VALIDATION.RELEASE_DATE_PATTERN.test(values.releaseDate)) {
        setError(t('movieAdmin.messages.validation.invalidReleaseDate'));
        return false;
      }

      const formattedMovie = {
        ...values,
        releaseDate: values.releaseDate || null,
        duration: values.duration !== undefined ? Number(values.duration) : null,
        title: values.title?.trim(),
        description: values.description?.trim(),
        genre: values.genre?.trim(),
        shortDescription: values.shortDescription?.trim(),
        director: values.director?.trim(),
        actors: values.actors?.trim(),
        language: values.language?.trim(),
        rated: values.rated?.trim(),
      };
      const response = await axios.post(MOVIE_ADMIN_CONSTANTS.API.BASE_URL, formattedMovie, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      if (response.data) {
        await fetchMovies();
        setNewMovie(MOVIE_ADMIN_CONSTANTS.DEFAULT_VALUES.NEW_MOVIE);
        setSuccessMessage(t('movieAdmin.messages.addSuccess'));
        setTimeout(() => setSuccessMessage(null), MOVIE_ADMIN_CONSTANTS.MESSAGES.SUCCESS_TIMEOUT);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error adding movie:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
        const errorMessage = error.response?.data?.error || error.response?.statusText || error.message || t('movieAdmin.messages.addError');
        setError(`Server error: ${error.response?.status || 'Unknown'} - ${errorMessage}`);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMovie = async (values: Movie) => {
    try {
      setLoading(true);
      if (!values.title || !values.description || !values.genre) {
        setError(t('movieAdmin.messages.updateError'));
        return false;
      }
      const durationValue = values.duration;
      if (durationValue !== undefined && (isNaN(durationValue) || durationValue <= 0)) {
        setError(t('movieAdmin.messages.updateError'));
        return false;
      }

      // Handle posterUrl - if it's a data URL or full URL, extract just the path
      let posterUrl = values.posterUrl?.trim() || '';
      if (posterUrl.startsWith('data:')) {
        // If it's a data URL, we need to handle it differently or skip it for now
        posterUrl = '';
      } else if (posterUrl.startsWith('http://localhost:8080')) {
        // Remove the base URL to get just the path
        posterUrl = posterUrl.replace('http://localhost:8080', '');
      } else if (posterUrl && !posterUrl.startsWith('/images/')) {
        // If it doesn't start with /images/, make sure it's in the correct format
        if (posterUrl.includes('/images/')) {
          posterUrl = posterUrl.substring(posterUrl.indexOf('/images/'));
        } else {
          posterUrl = '';
        }
      }

      const {
        movieId, // loại bỏ movieId khỏi object gửi lên
        ratingLabel,
        ranking,
        likes,
        ...rest
      } = values;

      const formattedMovie = {
        ...rest,
        releaseDate: values.releaseDate || null,
        duration: values.duration !== undefined ? Number(values.duration) : null,
        title: values.title?.trim(),
        description: values.description?.trim(),
        genre: values.genre?.trim(),
        shortDescription: values.shortDescription?.trim(),
        director: values.director?.trim(),
        actors: values.actors?.trim(),
        language: values.language?.trim(),
        rated: values.rated?.trim(),
        posterUrl: posterUrl,
      };
      console.log('Movie ID being updated:', values.movieId);
      console.log('Original movie data:', values);
      console.log('Data sent to backend:', formattedMovie);
      const response = await axios.put(`${MOVIE_ADMIN_CONSTANTS.API.BASE_URL}/${values.movieId}`, formattedMovie, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      if (response.data) {
        await fetchMovies(); // luôn lấy lại danh sách mới nhất từ backend
        setSelectedMovie(null);
        setSuccessMessage(t('movieAdmin.messages.updateSuccess'));
        setTimeout(() => setSuccessMessage(null), MOVIE_ADMIN_CONSTANTS.MESSAGES.SUCCESS_TIMEOUT);
        return true;
      }
      return false;
          } catch (error: any) {
        console.error('Error updating movie:', error);
        if (error.response) {
          console.error('Backend error response:', error.response.data);
          console.error('Backend error status:', error.response.status);
          console.error('Backend error headers:', error.response.headers);
        }
        if (error.response?.status === 401) {
          window.location.href = '/login';
        } else if (error.response?.status === 500) {
          setError(
            `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
          );
        } else {
          setError(
            error.response
              ? `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
              : t('movieAdmin.messages.updateError')
          );
        }
        return false;
      } finally {
        setLoading(false);
      }
  };

  const handleDeleteMovie = (movieId: string, movieTitle: string) => {
    Modal.confirm({
      title: t('movieAdmin.messages.deleteConfirmTitle', { defaultValue: 'Confirm Delete' }),
      content: t('movieAdmin.messages.deleteConfirm', { title: movieTitle }),
      okText: t('movieAdmin.form.delete', { defaultValue: 'Delete' }),
      okType: 'danger',
      cancelText: t('movieAdmin.form.cancel', { defaultValue: 'Cancel' }),
      onOk: async () => {
        try {
          setLoading(true);
          await axios.delete(`${MOVIE_ADMIN_CONSTANTS.API.BASE_URL}/${movieId}`, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          });
          await fetchMovies();
          setError(null);
          setSuccessMessage(t('movieAdmin.messages.deleteSuccess', { title: movieTitle }));
          setTimeout(() => setSuccessMessage(null), MOVIE_ADMIN_CONSTANTS.MESSAGES.SUCCESS_TIMEOUT);
        } catch (error: any) {
          console.error('Error deleting movie:', error);
          if (error.response?.status === 401) {
            window.location.href = '/login';
          } else {
            setError(
              error.response
                ? error.response.status === 404
                  ? t('movieAdmin.messages.movieNotFound')
                  : `Server error: ${error.response.status} - ${error.response.data.error || error.response.statusText}`
                : t('movieAdmin.messages.deleteFailed')
            );
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const totalPages = Math.ceil(movies.length / moviesPerPage);

  return (
    <div className="movies-admin-page-container">
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <MoviesAdmin
        movies={movies}
        loading={loading}
        error={error}
        setError={setError}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        moviesPerPage={moviesPerPage}
        totalPages={totalPages}
        newMovie={newMovie}
        setNewMovie={setNewMovie}
        selectedMovie={selectedMovie}
        setSelectedMovie={setSelectedMovie}
        onAddMovie={handleAddMovie}
        onUpdateMovie={handleUpdateMovie}
        onDeleteMovie={handleDeleteMovie}
      />
    </div>
  );
};

export default MoviesAdminPage;