import type { 
  EmployeeResponse, 
  AddEmployeeRequest, 
  UpdateEmployeeRequest, 
  ErrorResponse 
} from '../types/employee';
import { EMPLOYEE_CONSTANTS } from '../constants/employeeConstants';

const API_BASE_URL = 'http://localhost:8080';

/**
 * Employee Service for handling all employee-related API calls
 */
export class EmployeeService {
  private static instance: EmployeeService;

  private constructor() {}

  public static getInstance(): EmployeeService {
    if (!EmployeeService.instance) {
      EmployeeService.instance = new EmployeeService();
    }
    return EmployeeService.instance;
  }

  /**
   * Get all employees from the API
   */
  async getAllEmployees(page = 0, size = 5): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${EMPLOYEE_CONSTANTS.API_ENDPOINTS.GET_ALL_EMPLOYEES}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data; // Trả về object Page<EmployeeResponseDTO>
    } catch (error) {
      throw new Error(EMPLOYEE_CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(employeeId: string): Promise<EmployeeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${EMPLOYEE_CONSTANTS.API_ENDPOINTS.GET_EMPLOYEE_BY_ID(employeeId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(EMPLOYEE_CONSTANTS.ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);
    }
  }

  /**
   * Add new employee
   */
  async addEmployee(employeeData: AddEmployeeRequest): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}${EMPLOYEE_CONSTANTS.API_ENDPOINTS.ADD_EMPLOYEE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.text();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing employee
   */
  async updateEmployee(employeeData: UpdateEmployeeRequest): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}${EMPLOYEE_CONSTANTS.API_ENDPOINTS.UPDATE_EMPLOYEE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.text();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete employee (soft delete)
   */
  async deleteEmployee(employeeId: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}${EMPLOYEE_CONSTANTS.API_ENDPOINTS.DELETE_EMPLOYEE(employeeId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.text();
      return data;
    } catch (error) {
      throw new Error(EMPLOYEE_CONSTANTS.ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);
    }
  }

  /**
   * Restore deleted employee
   */
  async restoreEmployee(employeeId: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}${EMPLOYEE_CONSTANTS.API_ENDPOINTS.RESTORE_EMPLOYEE(employeeId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.text();
      return data;
    } catch (error) {
      throw new Error(EMPLOYEE_CONSTANTS.ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);
    }
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = EMPLOYEE_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR;

    try {
      const errorData: any = await response.json();
      errorMessage = errorData.originMessage || errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // If error response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    switch (response.status) {
      case 400:
        throw new Error(errorMessage);
      case 401:
        throw new Error(EMPLOYEE_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED);
      case 403:
        throw new Error(EMPLOYEE_CONSTANTS.ERROR_MESSAGES.FORBIDDEN);
      case 404:
        throw new Error(EMPLOYEE_CONSTANTS.ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);
      case 409:
        throw new Error(errorMessage);
      case 500:
        throw new Error(EMPLOYEE_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR);
      default:
        throw new Error(errorMessage);
    }
  }
}

// Export singleton instance
export const employeeService = EmployeeService.getInstance(); 