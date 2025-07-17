package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Entity representing a user in the system.
 * Used for authentication, authorization, and user profile management.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    /** The unique identifier for the user. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;
    /** The user's password (hashed). */
    private String password;
    /** The user's full name. */
    private String fullName;
    /** The user's date of birth. */
    private LocalDate dateOfBirth;
    /** The user's gender. */
    private String gender;
    /** The user's identity card number. */
    private String identityCard;
    /** The user's email address. */
    private String email;
    /** The user's address. */
    private String address;
    /** The user's phone number. */
    private String phoneNumber;
    /** The user's role (e.g., USER, ADMIN, EMPLOYEE). */
    @Column(nullable = false)
    private String role = "ROLE_USER";
    /** The user's account status (e.g., ACTIVE, INACTIVE). */
    @Column(nullable = false)
    private String status = "ACTIVE";
    /** Whether the user's email is verified. */
    @Column(name = "email_verified")
    private boolean emailVerified = false;
    /** The verification code for email or password reset. */
    @Column(name = "verification_code")
    private String verificationCode;
    /** The authentication provider (e.g., local, google). */
    @Column(nullable = true)
    private String provider;
    /** The provider-specific user ID (for OAuth2, etc.). */
    @Column(nullable = true)
    private String providerId;
}
