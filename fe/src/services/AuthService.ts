import axios from 'axios';
import type { UserResponseDTO, UserListResponseDTO } from '../types/response/UserResponseDTO';
import type { UserUpdateRequestDTO } from '../types/request/UserRequestDTO';
import {
  API_BASE_URL,
  LOGIN_ENDPOINT,
  REGISTER_ENDPOINT,
  VERIFY_REGISTER_CODE_ENDPOINT,
  RESEND_REGISTER_CODE_ENDPOINT,
  FORGOT_PASSWORD_ENDPOINT,
  VERIFY_OTP_ENDPOINT,
  RESET_PASSWORD_ENDPOINT,
  CHANGE_PASSWORD_ENDPOINT,
  EDIT_PROFILE_ENDPOINT,
  GET_PROFILE_ENDPOINT,
  CHECK_EMAIL_ENDPOINT,
  CHECK_PHONE_ENDPOINT,
  MEMBER_LIST_ENDPOINT,
  UPDATE_USER_ENDPOINT,
} from '../constants/ApiConst';

import type {
  LoginRequestDTO,
  RegisterRequestDTO,
  ForgotPasswordRequestDTO,
  VerifyOtpRequestDTO,
  ResetPasswordRequestDTO,
  ChangePasswordRequestDTO,
  EditProfileRequestDTO,
} from '../types/request/AuthRequestDTO';

import type {
  LoginResponseDTO,
  RegisterResponseDTO,
  ForgotPasswordResponseDTO,
  VerifyOtpResponseDTO,
  ResetPasswordResponseDTO,
  ChangePasswordResponseDTO,
  EditProfileResponseDTO,
  ProfileResponseDTO,
  CheckUniqueResponseDTO,
} from '../types/response/AuthResponseDTO';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login?error=SessionChanged';
      return; // Ngăn không trả về Promise.reject nữa
    }
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}:`, error.response?.data);
    return Promise.reject(error);
  }
);

export const login = async (payload: LoginRequestDTO): Promise<LoginResponseDTO> => {
  const response = await axiosInstance.post(LOGIN_ENDPOINT, payload);
  return response.data;
};

export const register = async (payload: RegisterRequestDTO): Promise<RegisterResponseDTO> => {
  console.log('🔍 Register API call details:');
  console.log('  - API_BASE_URL:', API_BASE_URL);
  console.log('  - REGISTER_ENDPOINT:', REGISTER_ENDPOINT);
  console.log('  - Full URL:', `${API_BASE_URL}${REGISTER_ENDPOINT}`);
  console.log('  - Payload:', payload);
  
  const response = await axiosInstance.post(REGISTER_ENDPOINT, payload);
  return response.data;
};

export const verifyRegisterCode = async (
  email: string,
  verificationCode: string
): Promise<RegisterResponseDTO> => {
  const response = await axiosInstance.post(VERIFY_REGISTER_CODE_ENDPOINT, { email, verificationCode });
  return response.data;
};

export const resendRegisterCode = async (email: string): Promise<RegisterResponseDTO> => {
  const response = await axiosInstance.post(RESEND_REGISTER_CODE_ENDPOINT, { email });
  return response.data;
};

export const forgotPassword = async (
  payload: ForgotPasswordRequestDTO
): Promise<ForgotPasswordResponseDTO> => {
  const response = await axiosInstance.post(`${FORGOT_PASSWORD_ENDPOINT}?email=${payload.email}`);
  return response.data;
};

export const verifyOtp = async (payload: VerifyOtpRequestDTO): Promise<VerifyOtpResponseDTO> => {
  const response = await axiosInstance.post(VERIFY_OTP_ENDPOINT, null, {
    params: {
      email: payload.email,
      otp: payload.otp,
    },
  });
  return response.data;
};

export const resetPassword = async (
  payload: ResetPasswordRequestDTO
): Promise<ResetPasswordResponseDTO> => {
  const response = await axiosInstance.post(RESET_PASSWORD_ENDPOINT, null, {
    params: {
      email: payload.email,
      newPassword: payload.newPassword,
    },
  });
  return response.data;
};

export const changePassword = async (
  payload: ChangePasswordRequestDTO
): Promise<ChangePasswordResponseDTO> => {
  const response = await axiosInstance.post(CHANGE_PASSWORD_ENDPOINT, payload);
  return response.data;
};

export const editProfile = async (
  payload: EditProfileRequestDTO
): Promise<EditProfileResponseDTO> => {
  const response = await axiosInstance.post(EDIT_PROFILE_ENDPOINT, payload);
  return response.data;
};

export const getProfile = async (): Promise<ProfileResponseDTO> => {
  const response = await axiosInstance.get(GET_PROFILE_ENDPOINT);
  return response.data;
};

export const checkEmailUnique = async (email: string): Promise<CheckUniqueResponseDTO> => {
  const response = await axiosInstance.get(CHECK_EMAIL_ENDPOINT, {
    params: { email },
  });
  return response.data;
};

export const checkPhoneUnique = async (phoneNumber: string): Promise<CheckUniqueResponseDTO> => {
  const response = await axiosInstance.get(CHECK_PHONE_ENDPOINT, {
    params: { phoneNumber },
  });
  return response.data;
};
// ========== Member APIs (Admin) ==========

export const getAllUsers = async (
  page: number,
  size: number
): Promise<UserListResponseDTO> => {
  const response = await axiosInstance.get(MEMBER_LIST_ENDPOINT, {
    params: { page, size },
  });
  return response.data;
};

export const updateUserById = async (
  payload: UserUpdateRequestDTO
): Promise<UserResponseDTO> => {
  const response = await axiosInstance.put(`${UPDATE_USER_ENDPOINT}/${payload.id}`, payload);
  return response.data;
};

// Test API connectivity
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing API connection to:', API_BASE_URL);
    const response = await axiosInstance.get('/api/health');
    console.log('✅ API connection successful:', response.status);
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};

// Test register endpoint
export const testRegisterEndpoint = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing register endpoint...');
    const testPayload = {
      fullName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '0901234567',
      identityCard: '123456789',
      password: 'TestPass123!',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: 'Test Address',
    };
    
    const response = await axiosInstance.post(REGISTER_ENDPOINT, testPayload);
    console.log('✅ Register endpoint test successful:', response.status);
    return true;
  } catch (error: any) {
    console.error('❌ Register endpoint test failed:', error.response?.status, error.response?.data);
    return false;
  }
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const response = await axiosInstance.get('/api/auth/check-email', { params: { email } });
  return response.data.exists;
};

export const checkPhoneExists = async (phoneNumber: string): Promise<boolean> => {
  const response = await axiosInstance.get('/api/auth/check-phone', { params: { phoneNumber } });
  return response.data.exists;
};


