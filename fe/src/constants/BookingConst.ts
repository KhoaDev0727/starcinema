// Booking Flow Constants
export const BOOKING_STEPS = {
  MOVIE_SELECTION: 'movie_selection',
  SHOWTIME_SELECTION: 'showtime_selection',
  SEAT_SELECTION: 'seat_selection',
  CONFIRMATION: 'confirmation',
  SUCCESS: 'success',
} as const;

// Seat Selection Constants
export const SEAT_CONSTRAINTS = {
  MAX_SEATS: Number(import.meta.env.VITE_MAX_SEATS_PER_BOOKING) || 8,
  MIN_SEATS: Number(import.meta.env.VITE_MIN_SEATS_PER_BOOKING) || 1,
} as const;

export const SEAT_TYPES = {
  NORMAL: import.meta.env.VITE_NORMAL_SEAT_TYPE || 'NORMAL',
  VIP: import.meta.env.VITE_VIP_SEAT_TYPE || 'VIP',
} as const;

export const SEAT_STATUS = {
  AVAILABLE: import.meta.env.VITE_AVAILABLE_SEAT_STATUS || 'AVAILABLE',
  BOOKED: import.meta.env.VITE_BOOKED_SEAT_STATUS || 'BOOKED',
  SELECTED: import.meta.env.VITE_SELECTED_SEAT_STATUS || 'SELECTED',
} as const;

// Date Selection Constants
export const DATE_SELECTION = {
  DEFAULT_DAYS_AHEAD: Number(import.meta.env.VITE_DEFAULT_DAYS_AHEAD) || 7,
  COUNTDOWN_SECONDS: Number(import.meta.env.VITE_BOOKING_COUNTDOWN_SECONDS) || 90,
  OTP_EXPIRY_SECONDS: Number(import.meta.env.VITE_OTP_EXPIRY_SECONDS) || 120,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  LOADING_DELAY: Number(import.meta.env.VITE_LOADING_DELAY) || 1000,
  TOAST_DURATION: Number(import.meta.env.VITE_TOAST_DURATION) || 3000,
  ANIMATION_DURATION: Number(import.meta.env.VITE_ANIMATION_DURATION) || 300,
} as const;

// Pricing Constants
export const PRICING = {
  VIP_SURCHARGE: Number(import.meta.env.VITE_VIP_SURCHARGE) || 20000, 
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: Number(import.meta.env.VITE_PASSWORD_MIN_LENGTH) || 8,
  MIN_AGE: Number(import.meta.env.VITE_MIN_AGE) || 16,
  PHONE_REGEX: new RegExp(import.meta.env.VITE_PHONE_REGEX || '^(0|\\+84)[0-9]{9}$'),
  IDENTITY_REGEX: new RegExp(import.meta.env.VITE_IDENTITY_REGEX || '^[0-9]{9,12}$'),
  NAME_REGEX: new RegExp(import.meta.env.VITE_NAME_REGEX || '^[a-zA-ZÀ-ỹ\\s\']{2,}$'),
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_SELECTION: 'INVALID_SELECTION',
  SEAT_CONSTRAINT: 'SEAT_CONSTRAINT',
  BOOKING_FAILED: 'BOOKING_FAILED',
  LOADING_FAILED: 'LOADING_FAILED',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_SUCCESS: 'BOOKING_SUCCESS',
  SEAT_SELECTED: 'SEAT_SELECTED',
  OTP_SENT: 'OTP_SENT',
  OTP_VERIFIED: 'OTP_VERIFIED',
} as const;