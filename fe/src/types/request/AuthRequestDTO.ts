export interface RegisterRequestDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  identityCard: string;
  password: string;
  dateOfBirth: string;
  gender: string;
  address: string;
}


export interface LoginRequestDTO {
  emailOrPhone: string;
  password: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface VerifyOtpRequestDTO {
  email: string;
  otp: string;
}

export interface ResetPasswordRequestDTO {
  email: string;
  newPassword: string;
}
export interface ChangePasswordRequestDTO {
  oldPassword: string;
  newPassword: string;
}

export interface EditProfileRequestDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  identityCard: string;
  dateOfBirth: string | null;
}
export interface UpdateUserRequestDTO {
  id: number;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  emailVerified?: boolean;
}
