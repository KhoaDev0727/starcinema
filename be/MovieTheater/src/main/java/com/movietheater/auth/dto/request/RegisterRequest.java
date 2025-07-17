package com.movietheater.auth.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Data Transfer Object for user registration requests.
 * Contains user information required for registration.
 */
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    /** The user's password. */
    private String password;
    /** The user's full name. */
    private String fullName;
    /** The user's date of birth. */
    private LocalDate dateOfBirth;
    /** The user's gender. */
    private String gender;
    /** The user's identity card number. */
    private String identityCard;
    /** The user's email address. */
    private String email;
    /** The user's address. */
    private String address;
    /** The user's phone number. */
    private String phoneNumber;
}