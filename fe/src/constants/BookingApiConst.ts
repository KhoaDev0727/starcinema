// Booking API Endpoints
export const BOOKING_API_ENDPOINTS = {
  // Movie endpoints
  MOVIE_LIST: '/api/book/v1/movie',
  MOVIE_DETAIL: (movieId: string) => `/api/book/v1/movie/${movieId}`,
  
  // Schedule endpoints
  SCHEDULE_BY_MOVIE: (movieId: string) => `/api/book/v1/schedule/${movieId}`,
  SCHEDULE_BY_THEATER: (theaterId: string) => `/api/schedules/theater/${theaterId}`,
  SCHEDULE_DETAIL: (scheduleId: string) => `/api/book/v1/schedule/id/${scheduleId}`,
  
  // Seat endpoints
  SEATS_BY_SCHEDULE: (scheduleId: string) => `/api/book/v1/seat/${scheduleId}`,
  
  // Booking endpoints
  CONFIRM_BOOKING: '/api/book/v1/confirm',
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const; 