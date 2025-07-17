// Schedule Management API Constants
export const SCHEDULE_API_ENDPOINTS = {
  // Showtime Management
  GET_SHOWTIMES: '/api/admin/showtime',
  GET_SHOWTIME_BY_ID: (scheduleId: string) => `/api/admin/showtime/${scheduleId}`,
  CREATE_SHOWTIME: '/api/admin/showtime',
  DELETE_SHOWTIME: (scheduleId: string) => `/api/admin/showtime/${scheduleId}`,
  UPDATE_SHOWTIME: (scheduleId: string) => `/api/admin/showtime/${scheduleId}`,
  
  // Movie Management
  GET_MOVIES: '/api/admin/movie',
  GET_MOVIE_BY_ID: (movieId: string) => `/api/admin/movie/${movieId}`,
  
  // Room Management
  GET_ROOMS: '/api/admin/room',
  GET_ROOM_BY_ID: (roomId: string) => `/api/admin/room/${roomId}`,
  
  // Theater Management
  GET_THEATERS: '/api/admin/theater',
  GET_THEATER_BY_ID: (theaterId: string) => `/api/admin/theater/${theaterId}`,
} as const;

// API Query Parameters
export const API_QUERY_PARAMS = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 50,
  PAGE_PARAM: 'page',
  SIZE_PARAM: 'size',
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