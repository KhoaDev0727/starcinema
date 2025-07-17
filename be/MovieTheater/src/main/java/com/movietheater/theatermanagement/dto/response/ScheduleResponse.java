package com.movietheater.theatermanagement.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for returning schedule details in theater management.
 */
@Getter
@Setter
@Builder
public class ScheduleResponse {
    /**
     * The unique ID of the schedule.
     */
    private String scheduleId;

    /**
     * The ID of the movie for the schedule.
     */
    private String movieId;

    /**
     * The title of the movie for the schedule.
     */
    private String movieTitle;

    /**
     * The ID of the room where the schedule takes place.
     */
    private String roomId;

    /**
     * The ID of the theater hosting the schedule.
     */
    private String theaterId;

    /**
     * The date and time of the schedule.
     */
    private String showtime;

    /**
     * The price of the schedule ticket.
     */
    private BigDecimal price;

    /**
     * The total number of seats available for the schedule.
     */
    private Integer totalSeats;

    /**
     * The number of seats still available for the schedule.
     */
    private Integer availableSeats;

    /**
     * The poster URL of the movie (optional).
     */
    private String posterUrl;
}