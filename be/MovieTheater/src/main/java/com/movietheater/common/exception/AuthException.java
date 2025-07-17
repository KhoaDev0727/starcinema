package com.movietheater.common.exception;

/**
 * General exception for authentication-related errors (invalid credentials, inactive account, email not verified).
 * Used throughout the authentication module to indicate authentication failures.
 */
public class AuthException extends RuntimeException {
    /**
     * Construct a new AuthException with the specified detail message.
     * @param message the detail message
     */
    public AuthException(String message) {
        super(message);
    }
} 