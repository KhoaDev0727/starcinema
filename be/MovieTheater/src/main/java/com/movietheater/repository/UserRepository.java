package com.movietheater.repository;

import com.movietheater.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Repository interface for User entity.
 * Provides methods for user authentication, lookup, and management.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Find users by a list of roles with pagination.
     * @param roles List of roles
     * @param pageable Pageable object
     * @return Page of users
     */
    Page<User> findByRoleIn(List<String> roles, Pageable pageable);
    /**
     * Check if a user exists by email.
     * @param email Email address
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);
    /**
     * Check if a user exists by phone number.
     * @param phoneNumber Phone number
     * @return true if exists, false otherwise
     */
    boolean existsByPhoneNumber(String phoneNumber);
    /**
     * Find a user by email.
     * @param email Email address
     * @return Optional of User
     */
    Optional<User> findByEmail(String email);
    /**
     * Find a user by phone number.
     * @param phoneNumber Phone number
     * @return Optional of User
     */
    Optional<User> findByPhoneNumber(String phoneNumber);
    /**
     * Find a user by provider and provider ID (for OAuth2).
     * @param provider Provider name
     * @param providerId Provider-specific user ID
     * @return Optional of User
     */
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    /**
     * Find a user by email or phone number.
     * @param email Email address
     * @param phoneNumber Phone number
     * @return Optional of User
     */
    Optional<User> findByEmailOrPhoneNumber(String email, String phoneNumber);
    /**
     * Find a user by verification code.
     * @param verificationCode Verification code
     * @return Optional of User
     */
    Optional<User> findByVerificationCode(String verificationCode);
    /**
     * Find the most recent user by email.
     * @param email Email address
     * @return Optional of User
     */
    Optional<User> findTopByEmailOrderByIdDesc(String email);
    /**
     * Find a user by email (case-insensitive).
     * @param email Email address
     * @return Optional of User
     */
    Optional<User> findByEmailIgnoreCase(String email);
    /**
     * Check if a user exists by identity card.
     * @param identityCard Identity card number
     * @return true if exists, false otherwise
     */
    boolean existsByIdentityCard(String identityCard);
    /**
     * Count the total number of users.
     * @return total user count
     */
    long count();
}