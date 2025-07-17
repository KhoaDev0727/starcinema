package com.movietheater.userprofileadmin.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

/**
 * Data Transfer Object for user details responses in the admin panel.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    /** The user ID. */
    private Long id;
    /** The user's full name. */
    private String fullName;
    /** The user's email address. */
    private String email;
    /** The user's phone number. */
    private String phoneNumber;
    /** The user's role. */
    private String role;
    /** The user's status. */
    private String status;
    /** Whether the user's email is verified. */
    private boolean emailVerified;
    /** The user's date of birth. */
    private LocalDate dateOfBirth;
    /** The user's gender. */
    private String gender;
    /** The user's address. */
    private String address;
    /** The user's authentication provider. */
    private String provider;
    /** The employee's hire date (if applicable). */
    private LocalDate hireDate;
    /** The employee's position (if applicable). */
    private String position;
    /** The employee's salary (if applicable). */
    private Double salary;
} 