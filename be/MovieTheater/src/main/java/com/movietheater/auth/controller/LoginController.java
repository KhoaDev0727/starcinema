package com.movietheater.auth.controller;

import com.movietheater.auth.dto.request.LoginRequest;
import com.movietheater.auth.dto.response.LoginResponse;
import com.movietheater.auth.service.LoginService;
import com.movietheater.common.annotation.RestApiErrorResponse;
import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.MessageConst;
import com.movietheater.common.constant.RouteConst;
import com.movietheater.util.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for handling login operations.
 * Provides endpoints for user login and logout.
 */
@RestController
@RequestMapping(RouteConst.AUTH_BASE)
@Slf4j
@RequiredArgsConstructor
public class LoginController {
    private final LoginService loginService;
    private static final int COOKIE_MAX_AGE = 24 * 60 * 60;

    /**
     * Authenticate a user and set authentication cookies.
     * @param request the login request containing user credentials
     * @param response the HTTP response to set cookies
     * @return the login response containing user details
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.LOGIN)
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {
        LoginResponse loginResponse = loginService.login(request.getEmailOrPhone(), request.getPassword());
        CookieUtil.addCookie(response, "userId", String.valueOf(loginResponse.getUserId()), COOKIE_MAX_AGE);
        CookieUtil.addCookie(response, "fullName", loginResponse.getFullName(), COOKIE_MAX_AGE);
        CookieUtil.addCookie(response, "role", loginResponse.getRole(), COOKIE_MAX_AGE);
        CookieUtil.addCookie(response, "status", loginResponse.getStatus(), COOKIE_MAX_AGE);
        return ResponseEntity.ok(loginResponse);
    }

    /**
     * Log out a user by clearing authentication cookies.
     * @param response the HTTP response to clear cookies
     * @return an empty response entity
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.LOGOUT)
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        CookieUtil.removeCookie(response, "userId");
        CookieUtil.removeCookie(response, "fullName");
        CookieUtil.removeCookie(response, "role");
        CookieUtil.removeCookie(response, "status");
        return ResponseEntity.ok().build();
    }
}