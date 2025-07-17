package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a showtime schedule in the movie theater application.
 */
@Entity
@Table(name = "SCHEDULES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {
    /**
     * The unique ID of the schedule.
     */
    @Id
    @Column(name = "SCHEDULE_ID")
    private String scheduleId;

    /**
     * The ID of the movie associated with the schedule.
     */
    @Column(name = "MOVIE_ID", nullable = false)
    private String movieId;

    /**
     * The ID of the room where the showtime takes place.
     */
    @Column(name = "ROOM_ID", nullable = false)
    private String roomId;

    /**
     * The ID of the theater hosting the showtime.
     */
    @Column(name = "THEATER_ID", nullable = false)
    private String theaterId;

    /**
     * The date and time of the showtime.
     */
    @Column(name = "SHOWTIME", nullable = false)
    private LocalDateTime showtime;

    /**
     * The ticket price for the showtime.
     */
    @Column(name = "PRICE", nullable = false)
    private BigDecimal price;

    /**
     * The total number of seats available for the showtime.
     */
    @Column(name = "TOTAL_SEATS", nullable = false)
    private Integer totalSeats;

    /**
     * The number of seats still available for the showtime.
     */
    @Column(name = "AVAILABLE_SEATS", nullable = false)
    private Integer availableSeats;
}