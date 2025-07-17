package com.movietheater.employee.controller;

import com.movietheater.employee.constant.EmployeeConst;
import com.movietheater.employee.dto.request.AddEmployeeRequestDTO;
import com.movietheater.employee.dto.request.UpdateEmployeeRequestDTO;
import com.movietheater.employee.dto.response.EmployeeResponseDTO;
import com.movietheater.employee.exception.EmployeeNotFoundException;
import com.movietheater.employee.exception.EmployeeValidationException;
import com.movietheater.employee.service.EmployeeService;
import com.movietheater.common.annotation.RestApiErrorResponse;
import com.movietheater.common.annotation.RestApiErrorResponses;
import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.MessageConst;
import com.movietheater.common.constant.RouteConst;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * REST controller for handling employee management operations.
 * Provides endpoints for CRUD operations on employee entities with proper authentication and authorization.
 */
@RestController
@RequestMapping(RouteConst.ADMIN_BASE + RouteConst.EMPLOYEES)
@Slf4j
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    /**
     * Retrieves all employees from the system.
     * Accessible by all users for testing purposes.
     *
     * @return ResponseEntity containing list of all employees
     */
    @GetMapping
    public ResponseEntity<Page<EmployeeResponseDTO>> getAllEmployees(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        List<EmployeeResponseDTO> employees = employeeService.getAllEmployees();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), employees.size());
        List<EmployeeResponseDTO> pageContent = employees.subList(start, end);
        Page<EmployeeResponseDTO> pageResult = new PageImpl<>(pageContent, pageable, employees.size());
        return ResponseEntity.ok(pageResult);
    }

    /**
     * Retrieves an employee by their unique ID.
     * Accessible by all users for testing purposes.
     *
     * @param employeeId the employee ID to search for
     * @return ResponseEntity containing the employee data
     */
    @GetMapping("/{employeeId}")
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Employee not found",
            code = "E1001",
            on = @RestApiErrorResponse.Exception(EmployeeNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR,
            message = "Failed to retrieve employee",
            code = "E1002",
            on = @RestApiErrorResponse.Exception(Exception.class)
        )
    })
    public ResponseEntity<EmployeeResponseDTO> getEmployeeById(@PathVariable String employeeId) {
        log.info("Retrieving employee with ID: {}", employeeId);
        EmployeeResponseDTO employee = employeeService.getEmployeeById(employeeId);
        log.info("Successfully retrieved employee: {}", employeeId);
        return ResponseEntity.ok(employee);
    }

    /**
     * Adds a new employee to the system.
     * Accessible by all users for testing purposes.
     * Validates all input data and ensures uniqueness of email, phone, and identity card.
     *
     * @param request the employee creation request containing all required fields
     * @return ResponseEntity with success message
     */
    @PostMapping
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid employee data",
            code = "E1003",
            on = @RestApiErrorResponse.Exception(EmployeeValidationException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.CONFLICT,
            message = "Employee already exists",
            code = "E1004",
            on = @RestApiErrorResponse.Exception(org.springframework.dao.DataIntegrityViolationException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR,
            message = "Failed to add employee",
            code = "E1005",
            on = @RestApiErrorResponse.Exception(Exception.class)
        )
    })
    public ResponseEntity<String> addEmployee(@Valid @RequestBody AddEmployeeRequestDTO request) {
        log.info("Adding new employee with email: {}", request.getEmail());
        employeeService.addEmployee(request);
        log.info("Successfully added employee with email: {}", request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(EmployeeConst.MSG_EMPLOYEE_ADDED);
    }

    /**
     * Updates an existing employee's information.
     * Accessible by all users for testing purposes.
     * Validates input data and ensures employee exists before updating.
     *
     * @param request the employee update request containing fields to update
     * @return ResponseEntity with success message
     */
    @PutMapping
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid employee data",
            code = "E1006",
            on = @RestApiErrorResponse.Exception(EmployeeValidationException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Employee not found",
            code = "E1007",
            on = @RestApiErrorResponse.Exception(EmployeeNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR,
            message = "Failed to update employee",
            code = "E1008",
            on = @RestApiErrorResponse.Exception(Exception.class)
        )
    })
    public ResponseEntity<String> updateEmployee(@Valid @RequestBody UpdateEmployeeRequestDTO request) {
        log.info("Updating employee with ID: {}", request.getEmployeeId());
        employeeService.updateEmployee(request);
        log.info("Successfully updated employee: {}", request.getEmployeeId());
        return ResponseEntity.ok(EmployeeConst.MSG_EMPLOYEE_UPDATED);
    }

    /**
     * Soft deletes an employee by setting their status to inactive.
     * Accessible by all users for testing purposes.
     * The employee record is preserved in the database for audit purposes.
     *
     * @param employeeId the employee ID to delete
     * @return ResponseEntity with success message
     */
    @DeleteMapping("/{employeeId}")
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Employee not found",
            code = "E1009",
            on = @RestApiErrorResponse.Exception(EmployeeNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR,
            message = "Failed to delete employee",
            code = "E1010",
            on = @RestApiErrorResponse.Exception(Exception.class)
        )
    })
    public ResponseEntity<String> deleteEmployee(@PathVariable String employeeId) {
        log.info("Deleting employee with ID: {}", employeeId);
        employeeService.deleteEmployee(employeeId);
        log.info("Successfully deleted employee: {}", employeeId);
        return ResponseEntity.ok(EmployeeConst.MSG_EMPLOYEE_DELETED);
    }

    /**
     * Restores a deleted employee by setting their status to active.
     * Accessible by all users for testing purposes.
     * Only works on employees that were previously soft deleted.
     *
     * @param employeeId the employee ID to restore
     * @return ResponseEntity with success message
     */
    @PutMapping("/{employeeId}/restore")
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Employee not found",
            code = "E1011",
            on = @RestApiErrorResponse.Exception(EmployeeNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR,
            message = "Failed to restore employee",
            code = "E1012",
            on = @RestApiErrorResponse.Exception(Exception.class)
        )
    })
    public ResponseEntity<String> restoreEmployee(@PathVariable String employeeId) {
        log.info("Restoring employee with ID: {}", employeeId);
        employeeService.restoreEmployee(employeeId);
        log.info("Successfully restored employee: {}", employeeId);
        return ResponseEntity.ok(EmployeeConst.MSG_EMPLOYEE_RESTORED);
    }
}