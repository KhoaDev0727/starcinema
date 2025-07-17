package com.movietheater.auth.service;

import com.movietheater.auth.dto.response.LoginResponse;

/**
 * Interface for handling login operations.
 * Provides method for user authentication.
 */
public interface LoginService {

    /**
     * Authenticate a user based on email or phone number and password.
     * @param emailOrPhone the email or phone number of the user
     * @param rawPassword the raw password provided by the user
     * @return the login response containing user details
     * @throws RuntimeException if authentication fails due to invalid credentials or inactive account
     */
    LoginResponse login(String emailOrPhone, String rawPassword);
}