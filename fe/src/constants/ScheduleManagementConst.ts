// Schedule Management Constants
export const SCHEDULE_MANAGEMENT = {
  ITEMS_PER_PAGE: Number(import.meta.env.VITE_SCHEDULE_ITEMS_PER_PAGE) || 5,
  DEFAULT_PAGE_SIZE: Number(import.meta.env.VITE_SCHEDULE_DEFAULT_PAGE_SIZE) || 50,
  SCROLL_THRESHOLD: Number(import.meta.env.VITE_SCHEDULE_SCROLL_THRESHOLD) || 300,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  SUCCESS_MESSAGE_DURATION: Number(import.meta.env.VITE_SUCCESS_MESSAGE_DURATION) || 3000,
  LOADING_DELAY: Number(import.meta.env.VITE_LOADING_DELAY) || 1000,
  ANIMATION_DURATION: Number(import.meta.env.VITE_ANIMATION_DURATION) || 300,
  MODAL_WIDTH: Number(import.meta.env.VITE_MODAL_WIDTH) || 520,
} as const;

// Date Format Constants
export const DATE_FORMATS = {
  DISPLAY_DATE: import.meta.env.VITE_DISPLAY_DATE_FORMAT || 'YYYY-MM-DD',
  DISPLAY_TIME: import.meta.env.VITE_DISPLAY_TIME_FORMAT || 'HH:mm',
  DATETIME: import.meta.env.VITE_DATETIME_FORMAT || 'YYYY-MM-DD HH:mm',
} as const;

// Validation Constants
export const VALIDATION = {
  PRICE_MIN: Number(import.meta.env.VITE_PRICE_MIN) || 1000,
  PRICE_MAX: Number(import.meta.env.VITE_PRICE_MAX) || 10000000,
  PRICE_PRECISION: Number(import.meta.env.VITE_PRICE_PRECISION) || 2,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'scheduleManagement.errors.networkError',
  LOADING_FAILED: 'scheduleManagement.errors.fetchShowtimeFailed',
  DELETE_FAILED: 'scheduleManagement.errors.deleteFailed',
  CREATE_FAILED: 'scheduleManagement.errors.createFailed',
  UPDATE_FAILED: 'scheduleManagement.errors.updateFailed',
  UNAUTHORIZED: 'scheduleManagement.errors.unauthorized',
  INVALID_DATA: 'scheduleManagement.errors.invalidData',
  SCHEDULING_CONFLICT: 'scheduleManagement.errors.schedulingConflict',
  HAS_BOOKINGS: 'scheduleManagement.errors.hasBookings',
  NOT_FOUND: 'scheduleManagement.errors.notFound',
  NO_MOVIES: 'scheduleManagement.errors.noMovies',
  NO_ROOMS: 'scheduleManagement.errors.noRooms',
  NO_THEATERS: 'scheduleManagement.errors.noTheaters',
  MAX_SHOWTIMES_REACHED: 'scheduleManagement.errors.maxShowtimesReached',
  UNKNOWN: 'scheduleManagement.errors.unknown',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  DELETE_SUCCESS: 'scheduleManagement.success.deleteSuccess',
  CREATE_SUCCESS: 'scheduleManagement.success.createSuccess',
  UPDATE_SUCCESS: 'scheduleManagement.success.updateSuccess',
} as const;

// Status Constants
export const SCHEDULE_STATUS = {
  ACTIVE: import.meta.env.VITE_SCHEDULE_STATUS_ACTIVE || 'ACTIVE',
  INACTIVE: import.meta.env.VITE_SCHEDULE_STATUS_INACTIVE || 'INACTIVE',
  CANCELLED: import.meta.env.VITE_SCHEDULE_STATUS_CANCELLED || 'CANCELLED',
  AVAILABLE: import.meta.env.VITE_SCHEDULE_STATUS_AVAILABLE || 'Available',
  FULL: import.meta.env.VITE_SCHEDULE_STATUS_FULL || 'Full',
} as const;