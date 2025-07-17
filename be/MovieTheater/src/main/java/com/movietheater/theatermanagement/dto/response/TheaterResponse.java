package com.movietheater.theatermanagement.dto.response;

import lombok.Data;

@Data
public class TheaterResponse {
    private String theaterId;
    private String theaterName;
    private String locationName;
    private String phoneNumber;
} 