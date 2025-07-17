package com.movietheater.userprofileadmin.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

/**
 * Data Transfer Object for user update/create requests in the admin panel.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDTO {
    /** The user's full name. */
    private String fullName;
    /** The user's email address. */
    private String email;
    /** The user's phone number. */
    private String phoneNumber;
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
} 