// TheaterAdmin Constants
export const THEATER_ADMIN_CONSTANTS = {
  API: {
    BASE_URL: 'http://localhost:8080/api/theaters',
    LOCATIONS_URL: 'http://localhost:8080/api/locations',
  },
  
  PAGINATION: {
    THEATERS_PER_PAGE: 5,
    SCROLL_THRESHOLD: 300,
  },
  
  VALIDATION: {
    THEATER_NAME_MAX_LENGTH: 255,
    PHONE_NUMBER_MAX_LENGTH: 20,
    PHONE_NUMBER_PATTERN: /^[0-9+\-\s()]*$/,
  },
  
  DEFAULT_VALUES: {
    NEW_THEATER: {
      theaterName: '',
      locationId: '',
      phoneNumber: '',
    },
  },
  
  MESSAGES: {
    SUCCESS_TIMEOUT: 3000,
    REQUEST_TIMEOUT: 3000,
  },
} as const;

export default THEATER_ADMIN_CONSTANTS; 