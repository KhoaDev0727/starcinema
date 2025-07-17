package com.movietheater.employee.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Data Transfer Object for employee responses.
 * Contains all employee information that can be returned to the client.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDTO {
    private Long userId;
    private String employeeId;
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String identityCard;
    private String email;
    private boolean emailVerified;
    private String phoneNumber;
    private String address;
    private String position;
    private Double salary;
    private String status;
    private String role;
    private LocalDate hireDate;
    private String provider;
    private String providerId;
} 