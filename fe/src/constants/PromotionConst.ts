export const PROMOTION_ENDPOINTS = {
  GET_ALL: '/api/admin/promotions',
  GET_BY_ID: '/api/admin/promotions/get',
  CREATE: '/api/admin/promotions',
  UPDATE: '/api/admin/promotions',
  DELETE: '/api/admin/promotions',
} as const;

export const PROMOTION_MESSAGES = {
  CREATE_SUCCESS: '✅ Promotion created successfully',
  UPDATE_SUCCESS: '✅ Promotion updated successfully',
  DELETE_SUCCESS: '✅ Promotion deleted successfully',
  CREATE_ERROR: '❌ Failed to create promotion',
  UPDATE_ERROR: '❌ Failed to update promotion',
  DELETE_ERROR: '❌ Failed to delete promotion',
  LOAD_ERROR: '❌ Failed to load promotions',
  VALIDATION_ERROR: '❌ Please check your input',
} as const;

export const PROMOTION_FIELDS = {
  TITLE: 'title',
  START_TIME: 'startTime',
  END_TIME: 'endTime',
  DISCOUNT: 'discount',
  DESCRIPTION: 'description',
  IMAGE_URL: 'imageUrl',
} as const;

export const PROMOTION_VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  DISCOUNT_MIN: 0,
  DISCOUNT_MAX: 100,
} as const; 