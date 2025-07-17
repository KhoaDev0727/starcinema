export interface RegisterResponseDTO {
  message: string;
  emailUsed?: boolean;
  phoneUsed?: boolean;
  identityCardUsed?: boolean;
}

export interface LoginResponseDTO {
  userId: string;
  fullName: string;
  role: string;
}

export interface ForgotPasswordResponseDTO {
  message: string;
}

export interface VerifyOtpResponseDTO {
  message: string;
  verified: boolean;
}

export interface ResetPasswordResponseDTO {
  message: string;
  success: boolean;
}
export interface ChangePasswordResponseDTO {
  message: string;
  success: boolean;
}

export interface EditProfileResponseDTO {
  message: string;
  success: boolean;
}

export interface ProfileResponseDTO {
  data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    gender: string;
    identityCard: string;
    dateOfBirth: string;
  };
}
export interface CheckUniqueResponseDTO {
  data: {
    available: boolean;
  };
}
export interface UserResponseDTO {
  id: number;
  username: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  identityCard?: string;
  email: string;
  address?: string;
  phoneNumber: string;
  role: string;
  status: string;
  emailVerified?: boolean;
  provider?: string;
  providerId?: string;
  serverError?: string;
  errorField?: string;
}