package com.movietheater.theatermanagement.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TheaterUpdateRequest {
    @Size(max = 255, message = "Theater name cannot exceed 255 characters")
    private String theaterName;

    private String locationId;

    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phoneNumber;
} 