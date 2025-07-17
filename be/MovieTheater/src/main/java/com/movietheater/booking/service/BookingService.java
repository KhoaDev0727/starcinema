package com.movietheater.booking.service;

import com.movietheater.booking.dto.request.BookingRequest;
import com.movietheater.booking.dto.response.BookingResponse;
import com.movietheater.booking.dto.response.MovieResponse;
import com.movietheater.entity.Booking;
import com.movietheater.entity.Schedule;
import com.movietheater.entity.ScheduleSeat;

import java.util.List;

/**
 * Interface for booking service operations.
 */
public interface BookingService {
    /**
     * Retrieves all movies with their posters.
     *
     * @return List of MovieResponse objects
     */
    List<MovieResponse> getAllMoviesWithPosters();

    /**
     * Retrieves a movie by its ID.
     *
     * @param movieId the ID of the movie
     * @return the MovieResponse object
     */
    MovieResponse getMovieById(String movieId);

    /**
     * Retrieves schedules for a specific movie.
     *
     * @param movieId the ID of the movie
     * @return List of Schedule objects
     */
    List<Schedule> getSchedulesByMovie(String movieId);

    /**
     * Retrieves a schedule by its ID.
     *
     * @param scheduleId the ID of the schedule
     * @return the Schedule object
     */
    Schedule getScheduleById(String scheduleId);

    /**
     * Retrieves seats for a specific schedule.
     *
     * @param scheduleId the ID of the schedule
     * @return List of ScheduleSeat objects
     */
    List<ScheduleSeat> getSeatsBySchedule(String scheduleId);

    /**
     * Creates a new booking.
     *
     * @param bookingRequest the booking request data
     * @return the created BookingResponse object
     */
    BookingResponse createBooking(BookingRequest bookingRequest);

    /**
     * Creates multiple bookings for multiple seats.
     *
     * @param bookingRequest the booking request data
     * @return List of created BookingResponse objects
     */
    List<BookingResponse> createBookings(BookingRequest bookingRequest);

    /**
     * Retrieves bookings for a specific user.
     *
     * @param userId the ID of the user
     * @return List of BookingResponse objects
     */
    List<BookingResponse> getBookingsByUserId(String userId);

    /**
     * Retrieves a booking by its ID for a specific user.
     *
     * @param bookingId the ID of the booking
     * @param userId the ID of the user
     * @return the BookingResponse object
     */
    BookingResponse getBookingById(String bookingId, String userId);

    /**
     * Cancels a booking by its ID for a specific user.
     *
     * @param bookingId the ID of the booking
     * @param userId the ID of the user
     */
    void cancelBooking(String bookingId, String userId);
}