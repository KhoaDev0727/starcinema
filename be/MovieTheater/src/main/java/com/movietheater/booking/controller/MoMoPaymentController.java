package com.movietheater.booking.controller;

import com.movietheater.booking.dto.request.BookingRequest;
import com.movietheater.booking.dto.response.BookingResponse;
import com.movietheater.booking.service.MoMoPaymentService;
import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.RouteConst;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping(RouteConst.BOOK_BASE)
@RequiredArgsConstructor
@Slf4j
public class MoMoPaymentController {
    private final MoMoPaymentService moMoPaymentService;

    @PostMapping("/momo/initiate")
    @PreAuthorize(AuthorityConst.AUTH_ROLE_USER)
    public ResponseEntity<Map<String, Object>> initiateMoMoPayment(
            @Valid @RequestBody BookingRequest bookingRequest,
            @RequestParam("totalAmount") BigDecimal totalAmount,
            HttpServletRequest request) {
        log.info("Initiating MoMo payment for user");
        try {
            String userId = extractUserIdFromCookies(request);
            if (userId == null) {
                log.warn("User not logged in");
                return ResponseEntity.status(401).body(Map.of("error", "Please login to initiate payment"));
            }
            bookingRequest.setUserId(userId);
            Map<String, Object> response = moMoPaymentService.initiateMoMoPayment(bookingRequest, totalAmount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error initiating MoMo payment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to initiate MoMo payment: " + e.getMessage()));
        }
    }

    @GetMapping("/momo/callback")
    public ResponseEntity<BookingResponse> handleMoMoCallback(@RequestParam Map<String, String> callbackParams) {
        log.info("Received MoMo callback");
        try {
            BookingResponse response = moMoPaymentService.handleMoMoCallback(callbackParams);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error handling MoMo callback: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    private String extractUserIdFromCookies(HttpServletRequest request) {
        var cookies = request.getCookies();
        if (cookies != null) {
            return java.util.Arrays.stream(cookies)
                .filter(cookie -> "userId".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
        }
        return null;
    }
}