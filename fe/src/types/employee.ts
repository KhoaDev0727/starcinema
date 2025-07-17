// Employee Types
export interface Employee {
  userId: number;
  employeeId: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  identityCard: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  address: string;
  position: string;
  salary: string;
  status: string;
  role: string;
  hireDate?: string;
  provider?: string;
  providerId?: string;
}

export interface AddEmployeeRequest {
  password: string;
  confirmPassword: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  identityCard: string;
  email: string;
  phoneNumber: string;
  address: string;
  position: string;
  salary: number;
}

export interface UpdateEmployeeRequest {
  employeeId: string;
  password?: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  identityCard: string;
  email: string;
  phoneNumber: string;
  address: string;
  position: string;
  salary: number;
  status: string;
}

export interface EmployeeResponse {
  userId: number;
  employeeId: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  identityCard: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  address: string;
  position: string;
  salary: number;
  status: string;
  role: string;
  hireDate: string;
  provider?: string;
  providerId?: string;
}

export interface EmployeeListResponse {
  employees: EmployeeResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errorCode?: string;
}

export interface ErrorResponse {
  message: string;
  errorCode: string;
  timestamp: string;
  path: string;
} 