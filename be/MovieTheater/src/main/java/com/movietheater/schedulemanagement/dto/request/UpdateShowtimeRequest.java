package com.movietheater.schedulemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Data Transfer Object for updating an existing showtime.
 */
@Getter
@Setter
public class UpdateShowtimeRequest {
    /**
     * The ID of the movie for the showtime.
     */
    @NotBlank(message = "Movie ID is required")
    private String movieId;

    /**
     * The ID of the room where the showtime will take place.
     */
    @NotBlank(message = "Room ID is required")
    private String roomId;

    /**
     * The ID of the theater hosting the showtime.
     */
    @NotBlank(message = "Theater ID is required")
    private String theaterId;

    /**
     * The date and time of the showtime in format yyyy-MM-dd HH:mm.
     */
    @NotBlank(message = "Showtime is required")
    private String showtime;

    /**
     * The price of the showtime ticket.
     */
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
}