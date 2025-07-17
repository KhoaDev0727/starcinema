package com.movietheater.employee.service;

import com.movietheater.employee.dto.request.AddEmployeeRequestDTO;
import com.movietheater.employee.dto.request.UpdateEmployeeRequestDTO;
import com.movietheater.employee.dto.response.EmployeeResponseDTO;

import java.util.List;

/**
 * Service interface for handling employee management operations.
 * Provides methods for CRUD operations on employee entities.
 */
public interface EmployeeService {

    /**
     * Retrieves all employees from the system.
     *
     * @return list of all employees
     * @throws RuntimeException if database access fails
     */
    List<EmployeeResponseDTO> getAllEmployees();

    /**
     * Retrieves an employee by their unique ID.
     *
     * @param employeeId the employee ID to search for
     * @return the employee response DTO
     * @throws EmployeeNotFoundException if employee is not found
     * @throws RuntimeException if database access fails
     */
    EmployeeResponseDTO getEmployeeById(String employeeId);

    /**
     * Adds a new employee to the system.
     * Validates all input data and ensures uniqueness of email, phone, and identity card.
     *
     * @param request the employee creation request containing all required fields
     * @throws EmployeeValidationException if validation fails
     * @throws RuntimeException if employee with same email/phone/identity card already exists
     * @throws RuntimeException if database access fails
     */
    void addEmployee(AddEmployeeRequestDTO request);

    /**
     * Updates an existing employee's information.
     * Validates input data and ensures employee exists before updating.
     *
     * @param request the employee update request containing fields to update
     * @throws EmployeeNotFoundException if employee is not found
     * @throws EmployeeValidationException if validation fails
     * @throws RuntimeException if database access fails
     */
    void updateEmployee(UpdateEmployeeRequestDTO request);

    /**
     * Soft deletes an employee by setting their status to inactive.
     * The employee record is preserved in the database for audit purposes.
     *
     * @param employeeId the employee ID to delete
     * @throws EmployeeNotFoundException if employee is not found
     * @throws RuntimeException if database access fails
     */
    void deleteEmployee(String employeeId);
    
    /**
     * Restores a deleted employee by setting their status to active.
     * Only works on employees that were previously soft deleted.
     *
     * @param employeeId the employee ID to restore
     * @throws EmployeeNotFoundException if employee is not found
     * @throws RuntimeException if database access fails
     */
    void restoreEmployee(String employeeId);
}