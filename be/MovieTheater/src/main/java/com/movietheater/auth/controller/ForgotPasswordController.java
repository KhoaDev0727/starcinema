package com.movietheater.auth.controller;

import com.movietheater.auth.service.ForgotPasswordService;
import com.movietheater.common.annotation.RestApiErrorResponse;
import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.MessageConst;
import com.movietheater.common.constant.RouteConst;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller for handling password reset operations.
 * Provides endpoints for sending OTP, verifying OTP, and resetting password.
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(RouteConst.AUTH_BASE)
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    /**
     * Send an OTP to the user's email for password reset.
     * @param email the user's email
     * @return a response map indicating success or failure
     */
    @RestApiErrorResponse(status = org.springframework.http.HttpStatus.BAD_REQUEST, message = "Email does not exist", code = MessageConst.ERROR_ACCOUNT_NOT_FOUND, on = @RestApiErrorResponse.Exception(IllegalArgumentException.class))
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.PASSWORD_FORGOT)
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestParam String email) {
        Map<String, Object> response = forgotPasswordService.sendOtp(email);
        return (Boolean) response.get("success")
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    /**
     * Verify the OTP for password reset.
     * @param email the user's email
     * @param otp the OTP to verify
     * @return a response map indicating success or failure
     */
    @RestApiErrorResponse(status = org.springframework.http.HttpStatus.BAD_REQUEST, message = "Invalid OTP", code = "E0009", on = @RestApiErrorResponse.Exception(IllegalArgumentException.class))
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.PASSWORD_VERIFY)
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @RequestParam String email,
            @RequestParam String otp) {
        Map<String, Object> response = forgotPasswordService.verifyOtp(email, otp);
        return (Boolean) response.get("success")
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    /**
     * Reset the user's password.
     * @param email the user's email
     * @param newPassword the new password
     * @return a response map indicating success or failure
     */
    @RestApiErrorResponse(status = org.springframework.http.HttpStatus.BAD_REQUEST, message = "Invalid password reset request", code = "E0010", on = @RestApiErrorResponse.Exception(IllegalArgumentException.class))
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.PASSWORD_RESET)
    public ResponseEntity<Map<String, Object>> resetPassword(
            @RequestParam String email,
            @RequestParam String newPassword) {
        Map<String, Object> response = forgotPasswordService.resetPassword(email, newPassword);
        return (Boolean) response.get("success")
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }
}