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
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListResponseDTO {
  content: UserResponseDTO[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
}

export interface UserDetailResponseDTO extends UserResponseDTO {
  lastLoginAt?: string;
  loginCount?: number;
  profileImageUrl?: string;
}

export interface UserProfileResponseDTO {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  emailVerified: boolean;
  dateOfBirth?: string;
  gender?: string;
  identityCard?: string;
  address?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
} 