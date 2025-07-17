package com.movietheater.auth.service.impl;

import com.movietheater.auth.service.ForgotPasswordService;
import com.movietheater.auth.service.MailService;
import com.movietheater.entity.User;
import com.movietheater.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.movietheater.common.constant.MessageConst;

/**
 * Implementation for handling forgot password operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class ForgotPasswordServiceImpl implements ForgotPasswordService {

    private final UserRepository userRepository;

    private final MailService mailService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public Map<String, Object> sendOtp(String email) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", MessageConst.MSG_EMAIL_NOT_FOUND);
            return response;
        }

        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        User user = userOpt.get();
        user.setVerificationCode(otp);

        try {
            userRepository.save(user);
            mailService.sendVerificationEmail(email, otp, "forgot");
            response.put("success", true);
            response.put("message", MessageConst.MSG_OTP_SENT);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", MessageConst.MSG_PASSWORD_RESET_INVALID);
        }

        return response;
    }

    @Override
    public Map<String, Object> verifyOtp(String email, String otp) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", MessageConst.MSG_EMAIL_NOT_FOUND);
            return response;
        }

        User user = userOpt.get();
        if (otp.equals(user.getVerificationCode())) {
            response.put("success", true);
            response.put("message", MessageConst.MSG_OTP_VALID);
        } else {
            response.put("success", false);
            response.put("message", MessageConst.MSG_OTP_INVALID);
        }

        return response;
    }

    @Override
    public Map<String, Object> resetPassword(String email, String newPassword) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", MessageConst.MSG_EMAIL_NOT_FOUND);
            return response;
        }

        User user = userOpt.get();

        if (encoder.matches(newPassword, user.getPassword())) {
            response.put("success", false);
            response.put("message", MessageConst.MSG_NEW_PASSWORD_SAME_AS_OLD);
            return response;
        }

        user.setPassword(encoder.encode(newPassword));
        user.setVerificationCode(null); // Clear OTP
        userRepository.save(user);

        response.put("success", true);
        response.put("message", MessageConst.MSG_PASSWORD_RESET_SUCCESS);
        return response;
    }
}
