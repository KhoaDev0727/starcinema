package com.movietheater.employee.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Data Transfer Object for adding new employee requests.
 * Contains all required fields for creating a new employee account.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddEmployeeRequestDTO {

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "Full name can only contain letters and spaces")
    private String fullName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(MALE|FEMALE|OTHER)$", message = "Gender must be MALE, FEMALE, or OTHER")
    private String gender;

    @NotBlank(message = "Identity card is required")
    @Pattern(regexp = "^[0-9]{9,12}$", message = "Identity card must be 9-12 digits")
    private String identityCard;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Phone number must be 10-11 digits")
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 200, message = "Address must be between 5 and 200 characters")
    private String address;

    @NotBlank(message = "Position is required")
    @Size(min = 2, max = 50, message = "Position must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "Position can only contain letters and spaces")
    private String position;

    @NotNull(message = "Salary is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Salary must be greater than 0")
    @DecimalMax(value = "999999999.99", message = "Salary must be less than 1 billion")
    private Double salary;
} 