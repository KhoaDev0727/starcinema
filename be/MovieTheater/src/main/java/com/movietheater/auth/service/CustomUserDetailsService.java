package com.movietheater.auth.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.UserDetailsService;

/**
 * Interface for handling custom user details operations.
 * Provides method for loading user details by username (email or phone).
 */
public interface CustomUserDetailsService extends UserDetailsService {
    /**
     * Load user details by email or phone number.
     * @param emailOrPhone the email or phone number
     * @return the UserDetails information
     * @throws UsernameNotFoundException if the user is not found
     */
    UserDetails loadUserByUsername(String emailOrPhone) throws UsernameNotFoundException;
}
