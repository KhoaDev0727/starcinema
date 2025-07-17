package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a seat for a specific showtime schedule.
 */
@Entity
@Table(name = "SCHEDULE_SEAT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleSeat {
    /**
     * The unique ID of the schedule seat.
     */
    @Id
    @Column(name = "SCHEDULE_SEAT_ID")
    private String scheduleSeatId;

    /**
     * The ID of the schedule associated with the seat.
     */
    @Column(name = "SCHEDULE_ID", nullable = false)
    private String scheduleId;

    /**
     * The row identifier of the seat (e.g., A, B, C).
     */
    @Column(name = "SEAT_ROW", nullable = false)
    private String seatRow;

    /**
     * The column number of the seat.
     */
    @Column(name = "SEAT_COLUMN", nullable = false)
    private Integer seatColumn;

    /**
     * The type of the seat (e.g., NORMAL, VIP).
     */
    @Column(name = "SEAT_TYPE", nullable = false)
    private String seatType;

    /**
     * The status of the seat (e.g., AVAILABLE, BOOKED).
     */
    @Column(name = "SEAT_STATUS", nullable = false)
    private String seatStatus;
}