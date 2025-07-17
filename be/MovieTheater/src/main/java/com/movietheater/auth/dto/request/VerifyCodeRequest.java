package com.movietheater.auth.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for verification code requests.
 * Contains information for verifying a user's email.
 */
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VerifyCodeRequest {
    /** The user's email address. */
    private String email;
    /** The verification code sent to the user. */
    private String verificationCode;
}