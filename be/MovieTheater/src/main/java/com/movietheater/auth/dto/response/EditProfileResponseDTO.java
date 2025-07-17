package com.movietheater.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Data Transfer Object for editing user profile responses.
 * Contains user profile information after an update.
 */
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EditProfileResponseDTO {
    /** The user's full name. */
    private String fullName;
    /** The user's email address. */
    private String email;
    /** The user's phone number. */
    private String phoneNumber;
    /** The user's address. */
    private String address;
    /** The user's gender. */
    private String gender;
    /** The user's date of birth. */
    private LocalDate dateOfBirth;
    /** The user's identity card number. */
    private String identityCard;
} 