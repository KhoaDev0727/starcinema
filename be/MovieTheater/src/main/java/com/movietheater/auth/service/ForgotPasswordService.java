package com.movietheater.auth.service;

import java.util.Map;

/**
 * Interface for handling forgot password operations.
 * Provides methods for sending OTP, verifying OTP, and resetting password.
 */
public interface ForgotPasswordService {
    /**
     * Send an OTP to the user's email for password reset.
     * @param email the user's email
     * @return a response map indicating success or failure
     */
    Map<String, Object> sendOtp(String email);

    /**
     * Verify the OTP for password reset.
     * @param email the user's email
     * @param otp the OTP to verify
     * @return a response map indicating success or failure
     */
    Map<String, Object> verifyOtp(String email, String otp);

    /**
     * Reset the user's password.
     * @param email the user's email
     * @param newPassword the new password
     * @return a response map indicating success or failure
     */
    Map<String, Object> resetPassword(String email, String newPassword);
}
