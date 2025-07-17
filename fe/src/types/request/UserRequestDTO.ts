export interface UserCreateRequestDTO {
  username: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  identityCard?: string;
  email: string;
  address?: string;
  phoneNumber: string;
  password: string;
}

export interface UserUpdateRequestDTO {
  id: number;
  username?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  identityCard?: string;
  email?: string;
  address?: string;
  phoneNumber?: string;
  status?: string;
}

export interface UserSearchRequestDTO {
  page?: number;
  size?: number;
  searchTerm?: string;
  role?: string;
  status?: string;
}

export interface UserDeleteRequestDTO {
  id: number;
} 