// Environment Configuration
export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // Booking Configuration
  MAX_SEATS_PER_BOOKING: parseInt(import.meta.env.VITE_MAX_SEATS_PER_BOOKING || '8'),
  MIN_SEATS_PER_BOOKING: parseInt(import.meta.env.VITE_MIN_SEATS_PER_BOOKING || '1'),
  OTP_EXPIRY_SECONDS: parseInt(import.meta.env.VITE_OTP_EXPIRY_SECONDS || '120'),
  COUNTDOWN_SECONDS: parseInt(import.meta.env.VITE_COUNTDOWN_SECONDS || '90'),
  
  // UI Configuration
  LOADING_DELAY: parseInt(import.meta.env.VITE_LOADING_DELAY || '1000'),
  TOAST_DURATION: parseInt(import.meta.env.VITE_TOAST_DURATION || '3000'),
  ANIMATION_DURATION: parseInt(import.meta.env.VITE_ANIMATION_DURATION || '300'),
  
  // API Timeout Configuration
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '5000'),
  API_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  API_RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),
  
  // Date Configuration
  DEFAULT_DAYS_AHEAD: parseInt(import.meta.env.VITE_DEFAULT_DAYS_AHEAD || '7'),
  TIMEZONE: import.meta.env.VITE_TIMEZONE || 'Asia/Ho_Chi_Minh',
  
  // Validation Configuration
  MIN_AGE: parseInt(import.meta.env.VITE_MIN_AGE || '16'),
  PASSWORD_MIN_LENGTH: parseInt(import.meta.env.VITE_PASSWORD_MIN_LENGTH || '8'),
  
  // Image Configuration
  DEFAULT_POSTER_URL: import.meta.env.VITE_DEFAULT_POSTER_URL || '/images/avatar.png',
  DEFAULT_SCREEN_URL: import.meta.env.VITE_DEFAULT_SCREEN_URL || '/images/bg-screen.png',
  DEFAULT_LOGO_URL: import.meta.env.VITE_DEFAULT_LOGO_URL || '/images/bg-logo-cinema.png',
} as const; 