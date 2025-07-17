package com.movietheater.ticketmanagement.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class TicketResponseDTO {

    private String ticketId;
    private Long userId;
    private String userName;
    private String movieId;
    private String movieTitle;
    private String theaterName;
    private String theaterAddress;
    private String roomName;
    private String seatId;
    private LocalDateTime showtime;
    private BigDecimal price;
    private Timestamp bookingDate;
    private String status;

    // Default constructor
    public TicketResponseDTO() {
    }

    public TicketResponseDTO(String ticketId, Long userId, String userName, String movieId, String movieTitle,
            String theaterName, String theaterAddress, String roomName, String seatId, LocalDateTime showtime,
            BigDecimal price, Timestamp bookingDate, String status) {
        this.ticketId = ticketId;
        this.userId = userId;
        this.userName = userName;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.theaterName = theaterName;
        this.theaterAddress = theaterAddress;
        this.roomName = roomName;
        this.seatId = seatId;
        this.showtime = showtime;
        this.price = price;
        this.bookingDate = bookingDate;
        this.status = status;
    }

}
