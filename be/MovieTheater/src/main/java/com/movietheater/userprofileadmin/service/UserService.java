package com.movietheater.userprofileadmin.service;

import org.springframework.data.domain.Page;
import com.movietheater.userprofileadmin.dto.request.UserRequestDTO;
import com.movietheater.userprofileadmin.dto.response.UserResponseDTO;

/**
 * Service interface for managing user accounts in the admin panel.
 */
public interface UserService {
    /**
     * Retrieves a paginated list of users with role USER or CUSTOMER.
     *
     * @param page the page number
     * @param size the page size
     * @return a paginated list of user response DTOs
     */
    Page<UserResponseDTO> getAllUsers(int page, int size);

    /**
     * Retrieves user details by user ID.
     *
     * @param id the user ID
     * @return the user response DTO
     */
    UserResponseDTO getUserById(Long id);

    /**
     * Updates user information by user ID.
     *
     * @param id the user ID
     * @param dto the user request DTO containing updated info
     * @return the updated user response DTO
     */
    UserResponseDTO updateUser(Long id, UserRequestDTO dto);
}
