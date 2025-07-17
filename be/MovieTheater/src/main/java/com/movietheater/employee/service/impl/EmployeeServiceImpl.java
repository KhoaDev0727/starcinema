package com.movietheater.employee.service.impl;

import com.movietheater.employee.constant.EmployeeConst;
import com.movietheater.employee.dto.request.AddEmployeeRequestDTO;
import com.movietheater.employee.dto.request.UpdateEmployeeRequestDTO;
import com.movietheater.employee.dto.response.EmployeeResponseDTO;
import com.movietheater.employee.exception.EmployeeNotFoundException;
import com.movietheater.employee.exception.EmployeeValidationException;
import com.movietheater.employee.service.EmployeeService;
import com.movietheater.entity.Employee;
import com.movietheater.entity.User;
import com.movietheater.repository.EmployeeRepository;
import com.movietheater.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Implementation of the EmployeeService interface for handling employee management operations.
 * Provides business logic for CRUD operations on employee entities with proper validation and error handling.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponseDTO> getAllEmployees() {
        log.info("Retrieving all employees from database");
        try {
            List<EmployeeResponseDTO> employees = employeeRepository.findAll().stream()
                    .map(this::mapToEmployeeResponseDTO)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            log.info("Successfully retrieved {} employees", employees.size());
            return employees;
        } catch (Exception e) {
            log.error("Failed to retrieve employees: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve employees", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponseDTO getEmployeeById(String employeeId) {
        log.info("Retrieving employee with ID: {}", employeeId);
        try {
            Employee employee = findEmployeeById(employeeId);
            EmployeeResponseDTO response = mapToEmployeeResponseDTO(employee);
            log.info("Successfully retrieved employee: {}", employeeId);
            return response;
        } catch (EmployeeNotFoundException e) {
            log.warn("Employee not found with ID: {}", employeeId);
            throw e;
        } catch (Exception e) {
            log.error("Failed to retrieve employee with ID {}: {}", employeeId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve employee", e);
        }
    }

    @Override
    public void addEmployee(AddEmployeeRequestDTO request) {
        log.info("Adding new employee with email: {}", request.getEmail());
        try {
            validateAddEmployeeRequest(request);
            validateUniqueConstraints(request);
            
            User user = createUserFromRequest(request);
            Employee employee = createEmployeeFromRequest(request, user);
            
            userRepository.save(user);
            employeeRepository.save(employee);
            
            log.info("Successfully added employee with ID: {}", employee.getEmployeeId());
        } catch (EmployeeValidationException e) {
            log.warn("Validation failed for employee with email {}: {}", request.getEmail(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Failed to add employee with email {}: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to add employee", e);
        }
    }

    @Override
    public void updateEmployee(UpdateEmployeeRequestDTO request) {
        log.info("Updating employee: {}", request.getEmployeeId());
        try {
            validateUpdateEmployeeRequest(request);
            validateUniqueConstraintsForUpdate(request); // Thêm dòng này
            Employee employee = findEmployeeById(request.getEmployeeId());
            User user = employee.getUser();
            if (user == null) {
                log.error("User not found for employee: {}", request.getEmployeeId());
                throw new EmployeeNotFoundException("User information not found for employee");
            }
            updateUserFromRequest(user, request);
            updateEmployeeFromRequest(employee, request);
            userRepository.save(user);
            employeeRepository.save(employee);
            log.info("Successfully updated employee: {}", request.getEmployeeId());
        } catch (EmployeeNotFoundException | EmployeeValidationException e) {
            log.warn("Failed to update employee with ID {}: {}", request.getEmployeeId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Failed to update employee with ID {}: {}", request.getEmployeeId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update employee", e);
        }
    }

    @Override
    public void deleteEmployee(String employeeId) {
        log.info("Deleting employee with ID: {}", employeeId);
        try {
            Employee employee = findEmployeeById(employeeId);
            User user = employee.getUser();
            
            if (user == null) {
                log.error("User not found for employee: {}", employeeId);
                throw new EmployeeNotFoundException("User information not found for employee");
            }
            
            user.setStatus(EmployeeConst.STATUS_INACTIVE);
            user.setRole(EmployeeConst.ROLE_EMPLOYEE);
            userRepository.save(user);
            
            log.info("Successfully deleted employee: {}", employeeId);
        } catch (EmployeeNotFoundException e) {
            log.warn("Employee not found for deletion with ID: {}", employeeId);
            throw e;
        } catch (Exception e) {
            log.error("Failed to delete employee with ID {}: {}", employeeId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete employee", e);
        }
    }

    @Override
    public void restoreEmployee(String employeeId) {
        log.info("Restoring employee with ID: {}", employeeId);
        try {
            Employee employee = findEmployeeById(employeeId);
            User user = employee.getUser();
            
            if (user == null) {
                log.error("User not found for employee: {}", employeeId);
                throw new EmployeeNotFoundException("User information not found for employee");
            }
            
            user.setStatus(EmployeeConst.STATUS_ACTIVE);
            user.setRole(EmployeeConst.ROLE_EMPLOYEE);
            userRepository.save(user);
            
            log.info("Successfully restored employee: {}", employeeId);
        } catch (EmployeeNotFoundException e) {
            log.warn("Employee not found for restoration with ID: {}", employeeId);
            throw e;
        } catch (Exception e) {
            log.error("Failed to restore employee with ID {}: {}", employeeId, e.getMessage(), e);
            throw new RuntimeException("Failed to restore employee", e);
        }
    }

    // Private helper methods

    private Employee findEmployeeById(String employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(
                    String.format("Employee not found with ID: %s", employeeId)
                ));
    }

    private EmployeeResponseDTO mapToEmployeeResponseDTO(Employee employee) {
        if (employee.getUser() == null) {
            log.warn("User is null for employee: {}", employee.getEmployeeId());
            return null;
        }
        
        User user = employee.getUser();
        return EmployeeResponseDTO.builder()
                .userId(user.getId())
                .employeeId(employee.getEmployeeId())
                .fullName(user.getFullName())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .identityCard(user.getIdentityCard())
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .position(employee.getPosition())
                .salary(employee.getSalary())
                .status(user.getStatus())
                .role(user.getRole())
                .hireDate(employee.getHireDate())
                .provider(user.getProvider())
                .providerId(user.getProviderId())
                .build();
    }

    private void validateAddEmployeeRequest(AddEmployeeRequestDTO request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new EmployeeValidationException("Password and confirmation do not match");
        }
        
        // Additional business validation
        if (request.getDateOfBirth().isAfter(LocalDate.now().minusYears(18))) {
            throw new EmployeeValidationException("Employee must be at least 18 years old");
        }
    }

    private void validateUpdateEmployeeRequest(UpdateEmployeeRequestDTO request) {
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().length() < 8) {
                throw new EmployeeValidationException("Password must be at least 8 characters long");
            }
        }
        
        // Additional business validation
        if (request.getDateOfBirth().isAfter(LocalDate.now().minusYears(18))) {
            throw new EmployeeValidationException("Employee must be at least 18 years old");
        }
    }

    private void validateUniqueConstraints(AddEmployeeRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmployeeValidationException("Email already exists in the system");
        }
        
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new EmployeeValidationException("Phone number already exists in the system");
        }
        
        if (userRepository.existsByIdentityCard(request.getIdentityCard())) {
            throw new EmployeeValidationException("Identity card already exists in the system");
        }
    }

    private User createUserFromRequest(AddEmployeeRequestDTO request) {
        User user = new User();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setIdentityCard(request.getIdentityCard());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setRole(EmployeeConst.ROLE_EMPLOYEE);
        user.setStatus(EmployeeConst.STATUS_ACTIVE);
        user.setEmailVerified(true);
        return user;
    }

    private Employee createEmployeeFromRequest(AddEmployeeRequestDTO request, User user) {
        Employee employee = new Employee();
        employee.setEmployeeId(generateEmployeeId());
        employee.setUser(user);
        employee.setHireDate(LocalDate.now());
        employee.setPosition(request.getPosition());
        employee.setSalary(request.getSalary());
        return employee;
    }

    private void updateUserFromRequest(User user, UpdateEmployeeRequestDTO request) {
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        user.setFullName(request.getFullName());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setIdentityCard(request.getIdentityCard());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setStatus(request.getStatus());
        user.setRole(EmployeeConst.ROLE_EMPLOYEE);
    }

    private void updateEmployeeFromRequest(Employee employee, UpdateEmployeeRequestDTO request) {
        employee.setPosition(request.getPosition());
        employee.setSalary(request.getSalary());
    }

    private String generateEmployeeId() {
        List<Employee> employees = employeeRepository.findAll();
        int maxId = employees.stream()
                .map(emp -> emp.getEmployeeId().replace(EmployeeConst.EMPLOYEE_ID_PREFIX, ""))
                .mapToInt(Integer::parseInt)
                .max()
                .orElse(0);
        return String.format("%s%03d", EmployeeConst.EMPLOYEE_ID_PREFIX, maxId + 1);
    }

    // Thêm hàm kiểm tra trùng khi update
    private void validateUniqueConstraintsForUpdate(UpdateEmployeeRequestDTO request) {
        Employee currentEmployee = findEmployeeById(request.getEmployeeId());
        User currentUser = currentEmployee.getUser();
        // Email
        if (!currentUser.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new EmployeeValidationException("Email already exists in the system");
        }
        // Phone
        if (!currentUser.getPhoneNumber().equals(request.getPhoneNumber()) && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new EmployeeValidationException("Phone number already exists in the system");
        }
        // Identity Card
        if (!currentUser.getIdentityCard().equals(request.getIdentityCard()) && userRepository.existsByIdentityCard(request.getIdentityCard())) {
            throw new EmployeeValidationException("Identity card already exists in the system");
        }
    }
}