package com.movietheater.auth.service;

import com.movietheater.entity.User;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;

/**
 * Interface for handling OAuth2 user service operations.
 * Provides method for processing OAuth2 users.
 */
public interface CustomOAuth2UserService extends OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    /**
     * Process the authenticated OAuth2 user and return the corresponding User entity.
     * @param oAuth2User the authenticated OAuth2 user
     * @return the User entity
     */
    User processOAuth2User(OAuth2User oAuth2User);
}
