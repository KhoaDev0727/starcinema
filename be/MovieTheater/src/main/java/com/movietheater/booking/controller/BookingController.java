package com.movietheater.booking.controller;

import com.movietheater.booking.dto.request.BookingRequest;
import com.movietheater.booking.dto.response.BookingResponse;
import com.movietheater.booking.dto.response.MovieResponse;
import com.movietheater.booking.service.BookingService;
import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.RouteConst;
import com.movietheater.entity.Schedule;
import com.movietheater.entity.ScheduleSeat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

/**
 * REST controller for managing booking operations in the movie theater application.
 */
@RestController
@RequestMapping(RouteConst.BOOK_BASE)
@RequiredArgsConstructor
@Slf4j
public class BookingController {
    private final BookingService bookingService;

    /**
     * Retrieves a list of all movies with their posters.
     *
     * @return a ResponseEntity containing a list of {@link MovieResponse} objects or an error status.
     */
    @GetMapping(RouteConst.MOVIE)
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    public ResponseEntity<List<MovieResponse>> getAllMovies() {
    	log.error("Fetching all movies with posters");
        try {
            return ResponseEntity.ok(bookingService.getAllMoviesWithPosters());
        } catch (Exception e) {
            log.error("Error fetching movies: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Retrieves a movie by its ID.
     *
     * @param movieId the ID of the movie to retrieve.
     * @return a ResponseEntity containing the {@link MovieResponse} object or an error status.
     */
    @GetMapping(RouteConst.MOVIE + RouteConst.API_PARAM_MOVIE_ID_PATH)
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    public ResponseEntity<MovieResponse> getMovieById(@PathVariable("movieId") String movieId) {
        log.info("Fetching movie with movieId: {}", movieId);
        try {
            return ResponseEntity.ok(bookingService.getMovieById(movieId));
        } catch (Exception e) {
            log.error("Error fetching movie with ID {}: {}", movieId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Retrieves all schedules for a specific movie.
     *
     * @param movieId the ID of the movie to retrieve schedules for.
     * @return a ResponseEntity containing a list of {@link Schedule} objects or an error status.
     */
    @GetMapping(RouteConst.SCHEDULE + RouteConst.API_PARAM_MOVIE_ID_PATH)
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    public ResponseEntity<List<Schedule>> getSchedulesByMovie(@PathVariable String movieId) {
        log.info("Fetching schedules for movieId: {}", movieId);
        try {
            return ResponseEntity.ok(bookingService.getSchedulesByMovie(movieId));
        } catch (Exception e) {
            log.error("Error fetching schedules for movieId {}: {}", movieId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Retrieves a schedule by its ID.
     *
     * @param scheduleId the ID of the schedule to retrieve.
     * @return a ResponseEntity containing the {@link Schedule} object or an error status.
     */
    @GetMapping(RouteConst.SCHEDULE_ID)
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    public ResponseEntity<Schedule> getScheduleById(@PathVariable String scheduleId) {
        log.info("Fetching schedule with scheduleId: {}", scheduleId);
        try {
            return ResponseEntity.ok(bookingService.getScheduleById(scheduleId));
        } catch (Exception e) {
            log.error("Error fetching schedule with ID {}: {}", scheduleId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Retrieves all seats for a specific schedule.
     *
     * @param scheduleId the ID of the schedule to retrieve seats for.
     * @return a ResponseEntity containing a list of {@link ScheduleSeat} objects or an error status.
     */
    @GetMapping(RouteConst.SEAT + RouteConst.API_PARAM_SCHEDULE_ID_PATH)
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    public ResponseEntity<List<ScheduleSeat>> getSeatsBySchedule(@PathVariable String scheduleId) {
        log.info("Fetching seats for scheduleId: {}", scheduleId);
        try {
            return ResponseEntity.ok(bookingService.getSeatsBySchedule(scheduleId));
        } catch (Exception e) {
            log.error("Error fetching seats for scheduleId {}: {}", scheduleId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Retrieves all bookings for the authenticated user.
     *
     * @param request the HTTP request containing user cookies.
     * @return a ResponseEntity containing a list of {@link BookingResponse} objects or an error status.
     */
    @GetMapping(RouteConst.BOOKINGS + "/user")
    @PreAuthorize(AuthorityConst.AUTH_ROLE_USER)
    public ResponseEntity<List<BookingResponse>> getBookingsByUserId(HttpServletRequest request) {
        log.info("Fetching bookings for authenticated user");
        try {
            String userId = extractUserIdFromCookies(request);
            if (userId == null) {
                log.warn("User not logged in or userId cookie not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
        } catch (Exception e) {
            log.error("Error fetching bookings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Retrieves a booking by its ID for the authenticated user.
     *
     * @param bookingId the ID of the booking to retrieve.
     * @param request the HTTP request containing user cookies.
     * @return a ResponseEntity containing the {@link BookingResponse} object or an error status.
     */
    @GetMapping(RouteConst.BOOKINGS + RouteConst.API_PARAM_ID_PATH)
    @PreAuthorize(AuthorityConst.AUTH_ROLE_USER)
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String bookingId, HttpServletRequest request) {
        log.info("Fetching booking with bookingId: {}", bookingId);
        try {
            String userId = extractUserIdFromCookies(request);
            if (userId == null) {
                log.warn("User not logged in or userId cookie not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            return ResponseEntity.ok(bookingService.getBookingById(bookingId, userId));
        } catch (Exception e) {
            log.error("Error fetching booking with ID {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Creates a new booking for the authenticated user.
     *
     * @param bookingRequest the booking request data.
     * @param request the HTTP request containing user cookies.
     * @return a ResponseEntity containing the booking result or an error status.
     */
    @PostMapping(RouteConst.CONFIRM)
    @PreAuthorize(AuthorityConst.AUTH_ROLE_USER)
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest bookingRequest, HttpServletRequest request) {
        log.info("Received booking request: {}", bookingRequest);
        try {
            String userId = extractUserIdFromCookies(request);
            if (userId == null) {
                log.warn("User not logged in");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login to book tickets");
            }
            bookingRequest.setUserId(userId);
            return ResponseEntity.ok(bookingService.createBookings(bookingRequest));
        } catch (Exception e) {
            log.error("Booking failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Booking failed: " + e.getMessage());
        }
    }

    /**
     * Cancels a booking by its ID for the authenticated user.
     *
     * @param bookingId the ID of the booking to cancel.
     * @param request the HTTP request containing user cookies.
     * @return a ResponseEntity indicating the result of the cancellation.
     */
    @DeleteMapping(RouteConst.BOOKINGS + RouteConst.API_PARAM_ID_PATH)
    @PreAuthorize(AuthorityConst.AUTH_ROLE_USER)
    public ResponseEntity<?> cancelBooking(@PathVariable String id, HttpServletRequest request) {
        log.info("Cancelling booking with bookingId: {}", id);
        try {
            String userId = extractUserIdFromCookies(request);
            if (userId == null) {
                log.warn("User not logged in or userId cookie not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login to cancel booking");
            }
            bookingService.cancelBooking(id, userId);
            return ResponseEntity.ok("Booking cancelled successfully");
        } catch (Exception e) {
            log.error("Error cancelling booking with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Cancel booking failed: " + e.getMessage());
        }
    }

    /**
     * Extracts the user ID from the cookies in the HTTP request.
     *
     * @param request the HTTP request containing cookies.
     * @return the user ID if found, otherwise null.
     */
    private String extractUserIdFromCookies(HttpServletRequest request) {
        var cookies = request.getCookies();
        if (cookies != null) {
            return java.util.Arrays.stream(cookies)
                .filter(cookie -> "userId".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
        }
        return null;
    }
}