package com.movietheater.userprofileadmin.service.impl;

import com.movietheater.entity.Employee;
import com.movietheater.entity.User;
import com.movietheater.userprofileadmin.dto.request.UserRequestDTO;
import com.movietheater.userprofileadmin.dto.response.UserResponseDTO;
import com.movietheater.userprofileadmin.service.UserService;
import com.movietheater.repository.EmployeeRepository;
import com.movietheater.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;
import com.movietheater.common.constant.MessageConst;

/**
 * Implementation of the UserService interface for managing user accounts in the admin panel.
 */
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponseDTO> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        List<String> roles = List.of("USER", "CUSTOMER");
        Page<User> userPage = userRepository.findByRoleIn(roles, pageable);
        return userPage.map(this::convertToResponseDTO);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, MessageConst.MSG_USER_NOT_FOUND));
        return convertToResponseDTO(user);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO updateUser(Long id, UserRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, MessageConst.MSG_USER_NOT_FOUND));

        updateUserBasicInfo(user, dto);
        User updatedUser = userRepository.save(user);

        return convertToResponseDTO(updatedUser);
    }

    /**
     * Updates the basic information of a user entity from a request DTO.
     *
     * @param user the user entity to update
     * @param dto the user request DTO containing updated info
     */
    private void updateUserBasicInfo(User user, UserRequestDTO dto) {
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setStatus(dto.getStatus());
        user.setDateOfBirth(dto.getDateOfBirth());
        user.setGender(dto.getGender());
        user.setAddress(dto.getAddress());
        user.setProvider(dto.getProvider());
        user.setEmailVerified(dto.isEmailVerified());
    }

    /**
     * Converts a User entity to a UserResponseDTO, including employee info if available.
     *
     * @param user the user entity to convert
     * @return the user response DTO
     */
    private UserResponseDTO convertToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setGender(user.getGender());
        dto.setAddress(user.getAddress());
        dto.setProvider(user.getProvider());
        // Optional: set employee info if exists
        Employee employee = employeeRepository.findByUserId(user.getId());
        if (employee != null) {
            dto.setHireDate(employee.getHireDate());
            dto.setPosition(employee.getPosition());
            dto.setSalary(employee.getSalary());
        }
        return dto;
    }
}
