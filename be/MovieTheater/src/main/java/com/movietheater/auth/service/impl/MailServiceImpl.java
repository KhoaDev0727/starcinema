package com.movietheater.auth.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.movietheater.auth.service.MailService;

/**
 * Implementation for handling mail operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class MailServiceImpl implements MailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends a verification email to the user.
     *
     * @param toEmail the recipient email address
     * @param verificationCode the verification code
     * @param type the type of email (forgot password/register)
     */
    @Override
    public void sendVerificationEmail(String toEmail, String verificationCode, String type) {
        try {
            String subject;
            String messageTitle;
            String messageNote;

            if ("forgot".equalsIgnoreCase(type)) {
                subject = "Reset Your Password - MovieTheater";
                messageTitle = "Password Reset Request";
                messageNote = "Use this code to reset your password.";
            } else {
                subject = "Verify Your MovieTheater Account";
                messageTitle = "Welcome to MovieTheater!";
                messageNote = "Please enter this code to activate your account.";
            }

            String htmlContent = "<div style='font-family:Arial,sans-serif; text-align:center;'>"
                    + "<h2 style='color:#b71c1c;'>" + messageTitle + "</h2>"
                    + "<p><strong>Your verification code is:</strong></p>"
                    + "<div style='padding:10px; background:#f8f8f8; display:inline-block; border-radius:8px;'>"
                    + "<h3 style='color:#e53935;'>" + verificationCode + "</h3></div>"
                    + "<p>" + messageNote + "</p>"
                    + "<p style='color:gray; font-size:0.9em;'>If you did not request this, please ignore.</p>"
                    + "<hr/><p style='font-size:0.8em;'>MovieTheater Team</p>"
                    + "</div>";

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent to {} with type {}", toEmail, type);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", toEmail, e);
        }
    }
}
