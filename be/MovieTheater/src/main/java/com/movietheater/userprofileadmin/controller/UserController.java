package com.movietheater.userprofileadmin.controller;

import com.movietheater.userprofileadmin.dto.request.UserRequestDTO;
import com.movietheater.userprofileadmin.dto.response.UserResponseDTO;
import com.movietheater.userprofileadmin.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing user accounts in the admin panel.
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    private final UserService userService;

    /**
     * Retrieves a paginated list of users with role USER or CUSTOMER.
     *
     * @param page the page number (default 0)
     * @param size the page size (default 10)
     * @return a paginated list of user response DTOs
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<UserResponseDTO> users = userService.getAllUsers(page, size);
        return ResponseEntity.ok(users);
    }

    /**
     * Retrieves user details by user ID.
     *
     * @param id the user ID
     * @return the user response DTO
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        UserResponseDTO dto = userService.getUserById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Updates user information by user ID.
     *
     * @param id the user ID
     * @param userRequestDTO the user request DTO containing updated info
     * @return the updated user response DTO
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserRequestDTO userRequestDTO) {
        UserResponseDTO updated = userService.updateUser(id, userRequestDTO);
        return ResponseEntity.ok(updated);
    }
}
