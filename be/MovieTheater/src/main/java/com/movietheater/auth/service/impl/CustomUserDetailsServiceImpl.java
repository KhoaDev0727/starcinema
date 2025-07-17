package com.movietheater.auth.service.impl;

import com.movietheater.auth.service.CustomUserDetailsService;
import com.movietheater.entity.User;
import com.movietheater.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Implementation for handling custom user details operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class CustomUserDetailsServiceImpl implements CustomUserDetailsService {

    private final UserRepository userRepo;

    /**
     * Loads user details by email or phone number.
     *
     * @param emailOrPhone the email or phone number
     * @return the UserDetails information
     * @throws UsernameNotFoundException if the user is not found
     */
    @Override
    public UserDetails loadUserByUsername(String emailOrPhone) throws UsernameNotFoundException {
        Optional<User> user = userRepo.findByEmailOrPhoneNumber(emailOrPhone, emailOrPhone);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found");
        }

        User u = user.get();
        return org.springframework.security.core.userdetails.User
                .withUsername(emailOrPhone)
                .password(u.getPassword())
                .roles(u.getRole())
                .build();
    }
}
