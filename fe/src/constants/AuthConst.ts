// Authentication Flow Constants
export const AUTH_STEPS = {
  LOGIN: 'login',
  REGISTER: 'register',
  VERIFY_EMAIL: 'verify_email',
  FORGOT_PASSWORD: 'forgot_password',
  VERIFY_OTP: 'verify_otp',
  RESET_PASSWORD: 'reset_password',
  CHANGE_PASSWORD: 'change_password',
  EDIT_PROFILE: 'edit_profile',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  USER: 'USER',
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
} as const;

// Gender Options
export const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

// Authentication Providers
export const AUTH_PROVIDERS = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
  FACEBOOK: 'FACEBOOK',
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: Number(import.meta.env.VITE_PASSWORD_MIN_LENGTH) || 8,
  USERNAME_MIN_LENGTH: Number(import.meta.env.VITE_USERNAME_MIN_LENGTH) || 3,
  USERNAME_MAX_LENGTH: Number(import.meta.env.VITE_USERNAME_MAX_LENGTH) || 20,
  FULLNAME_MIN_LENGTH: Number(import.meta.env.VITE_FULLNAME_MIN_LENGTH) || 2,
  FULLNAME_MAX_LENGTH: Number(import.meta.env.VITE_FULLNAME_MAX_LENGTH) || 50,
  MIN_AGE: Number(import.meta.env.VITE_MIN_AGE) || 16,
  MAX_AGE: Number(import.meta.env.VITE_MAX_AGE) || 100,
  OTP_LENGTH: Number(import.meta.env.VITE_OTP_LENGTH) || 6,
  VERIFICATION_CODE_LENGTH: Number(import.meta.env.VITE_VERIFICATION_CODE_LENGTH) || 6,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  LOADING_DELAY: Number(import.meta.env.VITE_AUTH_LOADING_DELAY) || 1000,
  TOAST_DURATION: Number(import.meta.env.VITE_AUTH_TOAST_DURATION) || 3000,
  ANIMATION_DURATION: Number(import.meta.env.VITE_AUTH_ANIMATION_DURATION) || 300,
  DEBOUNCE_DELAY: Number(import.meta.env.VITE_AUTH_DEBOUNCE_DELAY) || 500,
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  OTP_EXPIRY_SECONDS: Number(import.meta.env.VITE_OTP_EXPIRY_SECONDS) || 120,
  VERIFICATION_CODE_EXPIRY_SECONDS: Number(import.meta.env.VITE_VERIFICATION_CODE_EXPIRY_SECONDS) || 300,
  SESSION_TIMEOUT_MINUTES: Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 30,
  REMEMBER_ME_DAYS: Number(import.meta.env.VITE_REMEMBER_ME_DAYS) || 30,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  PHONE_ALREADY_EXISTS: 'PHONE_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
  INVALID_FORMAT: 'INVALID_FORMAT',
  SERVER_ERROR: 'SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  OTP_SENT: 'OTP_SENT',
  VERIFICATION_CODE_SENT: 'VERIFICATION_CODE_SENT',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_NAME: 'userName',
  USER_ROLE: 'userRole',
  REMEMBER_ME: 'rememberMe',
  REMEMBERED_EMAIL: 'rememberedEmail',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  LANGUAGE: 'language',
  THEME: 'theme',
} as const; 