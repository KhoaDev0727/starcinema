package com.movietheater.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for user registration responses.
 * Contains information about the registration result.
 */
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterResponse {
    /** Registration result message. */
    private String message;
    /** Whether the email is already used. */
    private boolean emailUsed;
    /** Whether the phone number is already used. */
    private boolean phoneUsed;
    /** Whether the identity card is already used. */
    private boolean identityCardUsed;
}