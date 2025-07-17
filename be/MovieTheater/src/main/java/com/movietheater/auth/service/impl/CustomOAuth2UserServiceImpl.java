package com.movietheater.auth.service.impl;

import com.movietheater.auth.service.CustomOAuth2UserService;
import com.movietheater.entity.User;
import com.movietheater.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation for handling OAuth2 user service operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class CustomOAuth2UserServiceImpl implements CustomOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(userRequest);
        processOAuth2User(oAuth2User);
        return oAuth2User;
    }

    @Override
    @Transactional
    public User processOAuth2User(OAuth2User oAuth2User) {
        if (oAuth2User == null) {
            throw new RuntimeException("Google login failed. Please try again.");
        }
        String email = oAuth2User.getAttribute("email");
        String fullName = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub");

        return userRepository.findByEmail(email).map(user -> {
            boolean changed = false;
            if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
                changed = true;
            }
            if (!"google".equalsIgnoreCase(user.getProvider())) {
                user.setProvider("google");
                changed = true;
            }
            if (providerId != null && (user.getProviderId() == null || !providerId.equals(user.getProviderId()))) {
                user.setProviderId(providerId);
                changed = true;
            }
            if (changed) {
                return userRepository.save(user);
            }
            return user;
        }).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(fullName);
            newUser.setRole("USER");
            newUser.setProvider("google");
            newUser.setStatus("ACTIVE");
            newUser.setEmailVerified(true);
            newUser.setProviderId(providerId);
            return userRepository.save(newUser);
        });
    }
}
