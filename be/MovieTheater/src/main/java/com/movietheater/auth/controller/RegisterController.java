package com.movietheater.auth.controller;

import com.movietheater.auth.dto.request.RegisterRequest;
import com.movietheater.auth.dto.request.VerifyCodeRequest;
import com.movietheater.auth.dto.response.RegisterResponse;
import com.movietheater.auth.service.RegisterService;
import com.movietheater.common.annotation.RestApiErrorResponse;
import com.movietheater.common.annotation.RestApiErrorResponses;
import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.MessageConst;
import com.movietheater.common.constant.RouteConst;
import com.movietheater.common.exception.dto.ErrorResponseBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * Controller for handling registration operations.
 * Provides endpoints for user registration, verification, and resending verification code.
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(RouteConst.AUTH_BASE)
public class RegisterController {

    private final RegisterService registerService;

    /**
     * Register a new user and send a verification email.
     * @param request the registration request containing user details
     * @return the registration response with a success or error message
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.REGISTER)
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = registerService.register(request);
        
        // Nếu có thông tin đã được sử dụng, trả về BAD_REQUEST
        if (response.isEmailUsed() || response.isPhoneUsed() || response.isIdentityCardUsed()) {
            return ResponseEntity.badRequest().body(response);
        }
        
        // Nếu đăng ký thành công, trả về OK
        return ResponseEntity.ok(response);
    }

    /**
     * Verify a user's email with a verification code.
     * @param request the verification request containing email and code
     * @return the verification response
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.REGISTER_VERIFY)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = MessageConst.MSG_VERIFICATION_CODE_INVALID,
            code = MessageConst.ERROR_VERIFICATION_CODE_INVALID,
            on = @RestApiErrorResponse.Exception(IllegalArgumentException.class)
        )
    })
    public ResponseEntity<?> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        boolean verified = registerService.verifyCode(request.getEmail(), request.getVerificationCode());
        if (verified) {
            return ResponseEntity.ok(RegisterResponse.builder()
                    .message(MessageConst.MSG_VERIFICATION_SUCCESS)
                    .emailUsed(false)
                    .phoneUsed(false)
                    .identityCardUsed(false)
                    .build());
        }
        throw new IllegalArgumentException(MessageConst.MSG_VERIFICATION_CODE_INVALID);
    }

    /**
     * Resend a verification code to the user's email.
     * @param request the request containing the user's email
     * @return the resend response
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.REGISTER_RESEND)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = MessageConst.MSG_EMAIL_NOT_FOUND,
            code = MessageConst.ERROR_EMAIL_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(IllegalArgumentException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = MessageConst.MSG_ACCOUNT_ALREADY_VERIFIED,
            code = MessageConst.ERROR_ACCOUNT_ALREADY_VERIFIED,
            on = @RestApiErrorResponse.Exception(IllegalStateException.class)
        )
    })
    public ResponseEntity<?> resendCode(@Valid @RequestBody VerifyCodeRequest request) {
        registerService.resendVerificationCode(request.getEmail());
        return ResponseEntity.ok(RegisterResponse.builder()
                .message(MessageConst.MSG_VERIFICATION_CODE_RESENT)
                .emailUsed(false)
                .phoneUsed(false)
                .identityCardUsed(false)
                .build());
    }
}