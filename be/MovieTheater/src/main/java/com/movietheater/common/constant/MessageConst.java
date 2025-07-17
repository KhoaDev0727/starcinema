package com.movietheater.common.constant;

/**
 * Constants for error and info messages used throughout the authentication and user management modules.
 */
public class MessageConst {
    // Error messages
    /** Error code for account not found. */
    public static final String ERROR_ACCOUNT_NOT_FOUND = "E0001";
    /** Error code for password not matching. */
    public static final String ERROR_PASSWORD_NOT_MATCH = "E0002";
    /** Error code for invalid date. */
    public static final String ERROR_INVALID_DATE = "E0004";
    /** Error code for entity not found. */
    public static final String ERROR_ENTITY_NOT_FOUND = "E0005";
    /** Error code for invalid credentials. */
    public static final String ERROR_INVALID_CREDENTIALS = "E1001";
    /** Error code for invalid verification code. */
    public static final String ERROR_VERIFICATION_CODE_INVALID = "E1002";
    /** Error code for account already verified. */
    public static final String ERROR_ACCOUNT_ALREADY_VERIFIED = "E1003";
    /** Error code for email not found. */
    public static final String ERROR_EMAIL_NOT_FOUND = "E1004";
    /** Error code for invalid OTP. */
    public static final String ERROR_OTP_INVALID = "E1005";
    /** Error code for invalid password reset. */
    public static final String ERROR_PASSWORD_RESET_INVALID = "E1006";
    /** Error code for inactive account. */
    public static final String ERROR_ACCOUNT_INACTIVE = "E1007";
    /** Error code for email not verified. */
    public static final String ERROR_EMAIL_NOT_VERIFIED = "E1008";
    /** Error code for registration info already used. */
    public static final String ERROR_REGISTER_INFO_USED = "E1009";
    /** Error code for new password same as old. */
    public static final String ERROR_NEW_PASSWORD_SAME_AS_OLD = "E1010";

    // Info messages
    public static final String INFO_REQUEST_SUCCESS = "I0001";

    // Message text
    public static final String MSG_REGISTER_INFO_USED = "Thông tin đăng ký đã được sử dụng";
    public static final String MSG_REGISTER_SUCCESS = "Registration successful. Please check your email for the 6-digit verification code.";
    public static final String MSG_VERIFICATION_SUCCESS = "Verification successful. Your account is now activated!";
    public static final String MSG_VERIFICATION_CODE_INVALID = "Verification code is incorrect or already used";
    public static final String MSG_VERIFICATION_CODE_RESENT = "Verification code resent successfully.";
    public static final String MSG_EMAIL_NOT_FOUND = "No user found with the provided email.";
    public static final String MSG_ACCOUNT_ALREADY_VERIFIED = "Your account is already verified.";
    public static final String MSG_LOGIN_INVALID = "Invalid email/phone or password.";
    public static final String MSG_ACCOUNT_INACTIVE = "Your account is not active. Please verify your email or contact support.";
    public static final String MSG_EMAIL_NOT_VERIFIED = "Your email is not verified. Please check your email to verify your account.";
    public static final String MSG_OTP_SENT = "OTP has been sent to your email.";
    public static final String MSG_OTP_INVALID = "OTP is incorrect or has expired.";
    public static final String MSG_OTP_VALID = "OTP is valid. You may reset your password.";
    public static final String MSG_PASSWORD_RESET_SUCCESS = "Password has been reset successfully.";
    public static final String MSG_PASSWORD_RESET_INVALID = "Invalid password reset request";
    public static final String MSG_NEW_PASSWORD_SAME_AS_OLD = "New password must be different from the old one.";
    public static final String MSG_USER_NOT_FOUND = "User not found";

    // Log message
    public static final String LOG_API_ACCESS = "[API_ACCESS] {} {} by user: {} - status: {} - duration: {}ms";
}