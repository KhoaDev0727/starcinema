package com.movietheater.schedulemanagement.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for returning showtime details.
 */
@Getter
@Setter
@Builder
public class ShowtimeResponse {
    /**
     * The unique ID of the showtime.
     */
    private String scheduleId;

    /**
     * The ID of the movie for the showtime.
     */
    private String movieId;

    /**
     * The title of the movie for the showtime.
     */
    private String movieTitle;

    /**
     * The ID of the room where the showtime takes place.
     */
    private String roomId;

    /**
     * The name of the room where the showtime takes place.
     */
    private String roomName;

    /**
     * The ID of the theater hosting the showtime.
     */
    private String theaterId;

    /**
     * The date and time of the showtime.
     */
    private LocalDateTime showtime;

    /**
     * The price of the showtime ticket.
     */
    private BigDecimal price;

    /**
     * The total number of seats available for the showtime.
     */
    private Integer totalSeats;

    /**
     * The number of seats still available for the showtime.
     */
    private Integer availableSeats;

    /**
     * The availability status of the showtime (e.g., Available, Full).
     */
    private String status;
}