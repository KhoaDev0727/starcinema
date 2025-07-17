package com.movietheater.theatermanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TheaterCreateRequest {
    @NotBlank(message = "Theater name is required")
    @Size(max = 255, message = "Theater name cannot exceed 255 characters")
    private String theaterName;

    @NotBlank(message = "Location ID is required")
    private String locationId;

    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phoneNumber;
} 