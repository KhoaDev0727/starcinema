package com.movietheater.booking.dto.request;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * Data Transfer Object for requesting a new booking.
 */
@Data
@Slf4j
public class BookingRequest {
    private String userId;
    private String scheduleId;
    private List<String> seatIds;
    private String promotionId;

    /**
     * Validates the booking request data.
     *
     * @throws IllegalArgumentException if any required field is invalid or missing
     */
    public void validate() {
        log.info("Validating BookingRequest");
        try {
            if (userId == null || userId.trim().isEmpty()) {
                log.error("Validation failed: userId is null or empty");
                throw new IllegalArgumentException("User ID is required");
            }
            if (scheduleId == null || scheduleId.trim().isEmpty()) {
                log.error("Validation failed: scheduleId is null or empty");
                throw new IllegalArgumentException("Schedule ID is required");
            }
            if (seatIds == null || seatIds.isEmpty()) {
                log.error("Validation failed: seatIds is null or empty");
                throw new IllegalArgumentException("At least one seat ID is required");
            }
            log.debug("BookingRequest validation passed");
        } catch (Exception e) {
            log.error("Validation error: {}", e.getMessage(), e);
            throw e;
        }
    }
}