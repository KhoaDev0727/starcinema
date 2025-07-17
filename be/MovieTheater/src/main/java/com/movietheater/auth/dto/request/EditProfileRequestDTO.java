package com.movietheater.auth.dto.request;

import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for editing user profile requests.
 * Contains user information for profile update.
 */
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EditProfileRequestDTO {
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