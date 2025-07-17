package com.movietheater.auth.service.impl;

import com.movietheater.auth.dto.response.LoginResponse;
import com.movietheater.auth.service.LoginService;
import com.movietheater.common.exception.AuthException;
import com.movietheater.entity.User;
import com.movietheater.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import com.movietheater.common.constant.MessageConst;

/**
 * Implementation for handling login operations.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;

    /**
     * Authenticates the user login.
     *
     * @param emailOrPhone the email or phone number
     * @param rawPassword the password
     * @return the login information
     */
    @Override
    public LoginResponse login(String emailOrPhone, String rawPassword) {
        Optional<User> optionalUser = emailOrPhone.contains("@")
                ? userRepository.findByEmail(emailOrPhone)
                : userRepository.findByPhoneNumber(emailOrPhone);
        if (optionalUser.isEmpty()) {
            log.warn("Account not found for email/phone: {}", emailOrPhone);
            throw new AuthException("Email hoặc số điện thoại không tồn tại trong hệ thống.");
        }
        User user = optionalUser.get();
        validatePassword(user, rawPassword, emailOrPhone);
        validateStatus(user, emailOrPhone);
        validateEmailVerified(user, emailOrPhone);
        return LoginResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    /**
     * Validates the user's password.
     *
     * @param user the user
     * @param rawPassword the input password
     * @param emailOrPhone the email or phone number
     */
    private void validatePassword(User user, String rawPassword, String emailOrPhone) {
        if (!encoder.matches(rawPassword, user.getPassword())) {
            log.warn("Incorrect password for user: {}", emailOrPhone);
            throw new AuthException("Mật khẩu không đúng.");
        }
    }

    /**
     * Validates the user's account status.
     *
     * @param user the user
     * @param emailOrPhone the email or phone number
     */
    private void validateStatus(User user, String emailOrPhone) {
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            log.warn("Inactive account for user: {}", emailOrPhone);
            throw new AuthException(MessageConst.MSG_ACCOUNT_INACTIVE);
        }
    }

    /**
     * Validates the user's email verification status.
     *
     * @param user the user
     * @param emailOrPhone the email or phone number
     */
    private void validateEmailVerified(User user, String emailOrPhone) {
        if ((user.getProvider() == null || "local".equalsIgnoreCase(user.getProvider())) && !user.isEmailVerified()) {
            log.warn("Email not verified for user: {}", emailOrPhone);
            throw new AuthException(MessageConst.MSG_EMAIL_NOT_VERIFIED);
        }
    }
}