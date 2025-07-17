package com.movietheater.auth.service.impl;

import com.movietheater.auth.dto.request.RegisterRequest;
import com.movietheater.auth.dto.response.RegisterResponse;
import com.movietheater.auth.service.MailService;
import com.movietheater.auth.service.RegisterService;
import com.movietheater.common.constant.MessageConst;
import com.movietheater.entity.User;
import com.movietheater.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;

/**
 * Implementation for handling registration operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class RegisterServiceImpl implements RegisterService {

    private final UserRepository userRepository;

    private final MailService mailService;

    /**
     * Registers a new user and sends a verification email.
     *
     * @param request the registration request containing user details
     * @return the registration response with a success message
     * @throws IllegalArgumentException if the email or phone number is already used
     */
    @Override
    public RegisterResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        boolean emailUsed = userRepository.existsByEmail(request.getEmail());
        boolean phoneUsed = userRepository.existsByPhoneNumber(request.getPhoneNumber());
        boolean identityCardUsed = userRepository.existsByIdentityCard(request.getIdentityCard());

        if (emailUsed || phoneUsed || identityCardUsed) {
            log.warn("Registration failed - Email used: {}, Phone used: {}, Identity card used: {}", 
                    emailUsed, phoneUsed, identityCardUsed);
            return RegisterResponse.builder()
                    .message(MessageConst.MSG_REGISTER_INFO_USED)
                    .emailUsed(emailUsed)
                    .phoneUsed(phoneUsed)
                    .identityCardUsed(identityCardUsed)
                    .build();
        }

        String verificationCode = String.format("%06d", new Random().nextInt(10000));

        User user = new User();
        user.setPassword(new BCryptPasswordEncoder().encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setIdentityCard(request.getIdentityCard());
        user.setEmail(request.getEmail());
        user.setAddress(request.getAddress());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole("USER");
        user.setStatus("ACTIVE");
        user.setEmailVerified(false);
        user.setVerificationCode(verificationCode);
        user.setProvider("local");

        userRepository.save(user);
        mailService.sendVerificationEmail(request.getEmail(), verificationCode, "register");

        return RegisterResponse.builder()
                .message(MessageConst.MSG_REGISTER_SUCCESS)
                .emailUsed(false)
                .phoneUsed(false)
                .identityCardUsed(false)
                .build();
    }

    /**
     * Verifies a user's email with a verification code.
     *
     * @param email the user's email
     * @param code  the verification code
     * @return true if verification is successful, false otherwise
     */
    @Override
    public boolean verifyCode(String email, String code) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (!user.isEmailVerified()
                    && user.getVerificationCode() != null
                    && code != null
                    && code.trim().equals(user.getVerificationCode().trim())) {

                user.setEmailVerified(true);
                user.setVerificationCode(null);
                userRepository.save(user);
                return true;
            } else {
                log.warn("Verification failed for email: {}", email);
            }
        } else {
            log.warn("No user found with email: {}", email);
        }

        return false;
    }

    /**
     * Resends a verification code to the user's email.
     *
     * @param email the user's email
     * @throws IllegalArgumentException if the email is not found
     * @throws IllegalStateException    if the account is already verified
     */
    @Override
    public void resendVerificationCode(String email) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (user.isEmailVerified()) {
                log.warn("Account already verified for email: {}", email);
                throw new IllegalStateException(MessageConst.MSG_ACCOUNT_ALREADY_VERIFIED);
            }

            String newCode = String.format("%06d", new Random().nextInt(10000));
            user.setVerificationCode(newCode);
            userRepository.save(user);
            mailService.sendVerificationEmail(email, newCode, "register");
        } else {
            log.warn("No user found with email: {}", email);
            throw new IllegalArgumentException(MessageConst.MSG_EMAIL_NOT_FOUND);
        }
    }
}
