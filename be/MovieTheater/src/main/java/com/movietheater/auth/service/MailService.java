package com.movietheater.auth.service;

/**
 * Interface for handling mail operations.
 * Provides method for sending verification emails.
 */
public interface MailService {
    /**
     * Send a verification email to the user.
     * @param toEmail the recipient email address
     * @param verificationCode the verification code
     * @param type the type of email (forgot password/register)
     */
    void sendVerificationEmail(String toEmail, String verificationCode, String type);
}
