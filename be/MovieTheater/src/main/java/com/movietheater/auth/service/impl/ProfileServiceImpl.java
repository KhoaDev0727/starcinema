package com.movietheater.auth.service.impl;

import com.movietheater.auth.dto.request.EditProfileRequestDTO;
import com.movietheater.auth.dto.response.EditProfileResponseDTO;
import com.movietheater.auth.service.ProfileService;
import com.movietheater.entity.User;
import com.movietheater.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * Implementation for handling profile operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * Changes the user's password.
     *
     * @param userId the user ID
     * @param oldPassword the old password
     * @param newPassword the new password
     */
    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getPassword() == null || user.getPassword().isBlank()) {
                log.warn("Attempt to change password for Google login account, userId: {}", userId);
                throw new RuntimeException("Cannot change password for Google login accounts");
            }

            if (!encoder.matches(oldPassword, user.getPassword())) {
                log.warn("Incorrect old password for userId: {}", userId);
                throw new RuntimeException("Current password is incorrect");
            }

            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);
            log.info("Password changed successfully for userId: {}", userId);
        } catch (Exception e) {
            log.error("Error changing password for userId: {}, error: {}", userId, e.getMessage());
            throw e;
        }
    }

    /**
     * Updates the user's profile information.
     *
     * @param userId the user ID
     * @param dto the profile update data
     */
    @Override
    public void editProfile(Long userId, EditProfileRequestDTO dto) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Kiểm tra email duy nhất
            if (!user.getEmail().equals(dto.getEmail())) {
                if (userRepository.existsByEmail(dto.getEmail()) &&
                        !userRepository.findByEmail(dto.getEmail()).get().getId().equals(userId)) {
                    log.warn("Email already exists for userId: {}, email: {}", userId, dto.getEmail());
                    throw new RuntimeException("Email already exists!");
                }
                if (!user.isEmailVerified() && dto.getEmail() != null && !dto.getEmail().isEmpty()) {
                    user.setEmail(dto.getEmail());
                }
            }

            // Kiểm tra phone duy nhất và xử lý rỗng
            if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().isEmpty()) {
                if (!Objects.equals(user.getPhoneNumber(), dto.getPhoneNumber())) {
                    if (userRepository.existsByPhoneNumber(dto.getPhoneNumber()) &&
                            !userRepository.findByPhoneNumber(dto.getPhoneNumber()).get().getId().equals(userId)) {
                        log.warn("Phone number already exists for userId: {}, phone: {}", userId,
                                dto.getPhoneNumber());
                        throw new RuntimeException("Phone number already exists!");
                    }
                }
                user.setPhoneNumber(dto.getPhoneNumber());
            }

            user.setFullName(dto.getFullName());
            user.setDateOfBirth(dto.getDateOfBirth());
            user.setGender(dto.getGender());
            user.setIdentityCard(dto.getIdentityCard());
            user.setAddress(dto.getAddress());

            userRepository.save(user);
            log.info("Profile updated successfully for userId: {}", userId);
        } catch (Exception e) {
            log.error("Error updating profile for userId: {}, error: {}", userId, e.getMessage());
            throw e;
        }
    }

    /**
     * Retrieves the user's profile information.
     *
     * @param userId the user ID
     * @return the profile information
     */
    @Override
    public EditProfileResponseDTO getProfile(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            log.info("Profile fetched successfully for userId: {}", userId);
            return EditProfileResponseDTO.builder()
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .address(user.getAddress())
                    .gender(user.getGender())
                    .dateOfBirth(user.getDateOfBirth())
                    .identityCard(user.getIdentityCard())
                    .build();
        } catch (Exception e) {
            log.error("Error fetching profile for userId: {}, error: {}", userId, e.getMessage());
            throw e;
        }
    }

    @Override
    public Map<String, Boolean> checkEmailAvailability(Long userId, String email) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            boolean available = !userRepository.findByEmail(email)
                    .filter(u -> !u.getId().equals(userId))
                    .isPresent();
            Map<String, Boolean> response = new HashMap<>();
            response.put("available", available);
            log.info("Checked email availability for userId: {}, email: {}, available: {}", userId, email,
                    available);
            return response;
        } catch (Exception e) {
            log.error("Error checking email availability for userId: {}, error: {}", userId, e.getMessage());
            throw e;
        }
    }

    @Override
    public Map<String, Boolean> checkPhoneAvailability(Long userId, String phone) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            boolean available = !userRepository.findByPhoneNumber(phone)
                    .filter(u -> !u.getId().equals(userId))
                    .isPresent();
            Map<String, Boolean> response = new HashMap<>();
            response.put("available", available);
            log.info("Checked phone availability for userId: {}, phone: {}, available: {}", userId, phone,
                    available);
            return response;
        } catch (Exception e) {
            log.error("Error checking phone availability for userId: {}, error: {}", userId, e.getMessage());
            throw e;
        }
    }
}