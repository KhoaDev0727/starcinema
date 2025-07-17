package com.movietheater.booking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for returning booking details.
 */
@Data
@Builder
public class BookingResponse {
    private String bookingId;
    private String userId;
    private String scheduleId;
    private String seatId;
    private LocalDateTime bookingDate;
    private String status;
    private String promotionId;
    private BigDecimal price;
}