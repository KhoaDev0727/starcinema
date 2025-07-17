// MovieAdmin Constants
export const MOVIE_ADMIN_CONSTANTS = {
  API: {
    BASE_URL: 'http://localhost:8080/api/admin/movie',
    SEARCH_ENDPOINT: '/search',
  },
  
  PAGINATION: {
    MOVIES_PER_PAGE: 5,
    SCROLL_THRESHOLD: 300, // Show scroll buttons after scrolling 300px
  },
  
  VALIDATION: {
    POSTER_URL_PATTERN: /^(\/images\/.*\.(png|jpg|jpeg|gif)|https?:\/\/.*\.(png|jpg|jpeg|gif))$/,
    RELEASE_DATE_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
    MIN_SEARCH_LENGTH: 3,
    DEBOUNCE_DELAY: 300,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  },
  
  DEFAULT_VALUES: {
    NEW_MOVIE: {
      title: '',
      shortDescription: '',
      description: '',
      director: '',
      actors: '',
      genre: '',
      releaseDate: '',
      duration: 0,
      language: '',
      rated: '',
      posterUrl: '',
    },
    DEFAULT_POSTER: '/images/default-poster.jpg',
  },
  
  GENRES: {
    ACTION: 'Action',
    COMEDY: 'Comedy',
    DRAMA: 'Drama',
    HORROR: 'Horror',
    SCI_FI: 'Sci-Fi',
    ROMANCE: 'Romance',
    THRILLER: 'Thriller',
  },
  
  MESSAGES: {
    SUCCESS_TIMEOUT: 3000,
    REQUEST_TIMEOUT: 3000,
  },
  
  URLS: {
    LOCALHOST_8080: 'http://localhost:8080',
  },
} as const;

export default MOVIE_ADMIN_CONSTANTS; 