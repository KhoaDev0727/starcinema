// Employee Constants
export const EMPLOYEE_CONSTANTS = {
  // API Endpoints
  API_ENDPOINTS: {
    GET_ALL_EMPLOYEES: '/api/admin/employees',
    GET_EMPLOYEE_BY_ID: (id: string) => `/api/admin/employees/${id}`,
    ADD_EMPLOYEE: '/api/admin/employees',
    UPDATE_EMPLOYEE: '/api/admin/employees',
    DELETE_EMPLOYEE: (id: string) => `/api/admin/employees/${id}`,
    RESTORE_EMPLOYEE: (id: string) => `/api/admin/employees/${id}/restore`,
  },

  // Status
  STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
  },

  // Roles
  ROLES: {
    EMPLOYEE: 'EMPLOYEE',
    ADMIN: 'ADMIN',
  },

  // Gender
  GENDER: {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER',
  },

  // Validation
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 100,
    FULL_NAME_MIN_LENGTH: 2,
    FULL_NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 100,
    PHONE_MIN_LENGTH: 10,
    PHONE_MAX_LENGTH: 11,
    IDENTITY_CARD_MIN_LENGTH: 9,
    IDENTITY_CARD_MAX_LENGTH: 12,
    ADDRESS_MIN_LENGTH: 5,
    ADDRESS_MAX_LENGTH: 200,
    POSITION_MIN_LENGTH: 2,
    POSITION_MAX_LENGTH: 50,
    SALARY_MIN: 0,
    SALARY_MAX: 999999999.99,
    MIN_AGE: 18,
  },

  // Error Messages
  ERROR_MESSAGES: {
    EMPLOYEE_NOT_FOUND: 'Employee not found',
    VALIDATION_FAILED: 'Validation failed',
    EMAIL_EXISTS: 'Email already exists in the system',
    PHONE_EXISTS: 'Phone number already exists in the system',
    IDENTITY_CARD_EXISTS: 'Identity card already exists in the system',
    PASSWORD_MISMATCH: 'Password and confirmation do not match',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
    INVALID_AGE: 'Employee must be at least 18 years old',
    NETWORK_ERROR: 'Network error occurred',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    SERVER_ERROR: 'Server error occurred',
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    EMPLOYEE_ADDED: 'Employee added successfully',
    EMPLOYEE_UPDATED: 'Employee updated successfully',
    EMPLOYEE_DELETED: 'Employee deleted successfully',
    EMPLOYEE_RESTORED: 'Employee restored successfully',
  },

  // Table Columns
  TABLE_COLUMNS: {
    EMPLOYEE_ID: 'employeeId',
    FULL_NAME: 'fullName',
    POSITION: 'position',
    ROLE: 'role',
    EMAIL: 'email',
    EMAIL_VERIFIED: 'emailVerified',
    PHONE_NUMBER: 'phoneNumber',
    STATUS: 'status',
    ACTIONS: 'actions',
  },

  // Form Fields
  FORM_FIELDS: {
    PASSWORD: 'password',
    CONFIRM_PASSWORD: 'confirmPassword',
    FULL_NAME: 'fullName',
    DATE_OF_BIRTH: 'dateOfBirth',
    GENDER: 'gender',
    IDENTITY_CARD: 'identityCard',
    EMAIL: 'email',
    PHONE_NUMBER: 'phoneNumber',
    ADDRESS: 'address',
    POSITION: 'position',
    SALARY: 'salary',
    STATUS: 'status',
  },
};

// Employee Status Options
export const EMPLOYEE_STATUS_OPTIONS = [
  { value: EMPLOYEE_CONSTANTS.STATUS.ACTIVE, label: 'employeeAdmin.statusOptions.ACTIVE' },
  { value: EMPLOYEE_CONSTANTS.STATUS.INACTIVE, label: 'employeeAdmin.statusOptions.INACTIVE' },
];

// Employee Gender Options
export const EMPLOYEE_GENDER_OPTIONS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

// Employee Role Options
export const EMPLOYEE_ROLE_OPTIONS = [
  { value: EMPLOYEE_CONSTANTS.ROLES.EMPLOYEE, label: 'Employee' },
  { value: EMPLOYEE_CONSTANTS.ROLES.ADMIN, label: 'Admin' },
]; 