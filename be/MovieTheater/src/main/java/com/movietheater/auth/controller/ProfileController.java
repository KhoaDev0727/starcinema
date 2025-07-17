package com.movietheater.auth.controller;

import com.movietheater.auth.dto.request.ChangePasswordRequestDTO;
import com.movietheater.auth.dto.request.EditProfileRequestDTO;
import com.movietheater.auth.dto.response.EditProfileResponseDTO;
import com.movietheater.auth.service.ProfileService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling profile operations.
 * Provides endpoints for changing password, editing profile, and checking user info.
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class ProfileController {

    private final ProfileService profileService;

    /**
     * Change the user's password.
     * @param dto ChangePasswordRequestDTO containing old and new password
     * @param request HttpServletRequest to extract user info
     * @return ResponseEntity with operation result
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody ChangePasswordRequestDTO dto,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long userId = extractUserIdFromCookies(request);
            profileService.changePassword(userId, dto.getOldPassword(), dto.getNewPassword());
            response.put("success", true);
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    /**
     * Edit the user's profile information.
     * @param dto EditProfileRequestDTO with new profile data
     * @param request HttpServletRequest to extract user info
     * @return ResponseEntity with operation result
     */
    @PostMapping("/edit-profile")
    public ResponseEntity<Map<String, Object>> editProfile(
            @RequestBody EditProfileRequestDTO dto,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long userId = extractUserIdFromCookies(request);
            profileService.editProfile(userId, dto);
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    /**
     * Get the user's profile information.
     * @param request HttpServletRequest to extract user info
     * @return ResponseEntity with profile data
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long userId = extractUserIdFromCookies(request);
            System.out.println("Fetching profile for userId = " + userId);
            response.put("success", true);
            response.put("data", profileService.getProfile(userId));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error fetching profile:");
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(401).body(response);
        }
    }

    /**
     * Check if the given email is available for the user.
     * @param email Email to check
     * @param request HttpServletRequest to extract user info
     * @return ResponseEntity with availability result
     */
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmail(@RequestParam String email, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long userId = extractUserIdFromCookies(request);
            response.put("success", true);
            response.put("data", profileService.checkEmailAvailability(userId, email));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    /**
     * Check if the given phone number is available for the user.
     * @param phone Phone number to check
     * @param request HttpServletRequest to extract user info
     * @return ResponseEntity with availability result
     */
    @GetMapping("/check-phone")
    public ResponseEntity<Map<String, Object>> checkPhone(@RequestParam String phone, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long userId = extractUserIdFromCookies(request);
            response.put("success", true);
            response.put("data", profileService.checkPhoneAvailability(userId, phone));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    /**
     * Extract userId from cookies in the request.
     * @param request HttpServletRequest containing cookies
     * @return userId as Long
     * @throws RuntimeException if userId cookie is not found
     */
    private Long extractUserIdFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) {
            System.out.println("No cookies received in request");
            throw new RuntimeException("No cookies in request");
        }

        for (Cookie cookie : request.getCookies()) {
            System.out.println("Cookie received: " + cookie.getName() + " = " + cookie.getValue());
            if ("userId".equals(cookie.getName())) {
                System.out.println("Found userId = " + cookie.getValue());
                return Long.parseLong(cookie.getValue());
            }
        }

        throw new RuntimeException("userId cookie not found");
    }
}