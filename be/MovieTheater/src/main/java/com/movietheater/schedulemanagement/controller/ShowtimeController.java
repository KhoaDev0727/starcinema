package com.movietheater.schedulemanagement.controller;

import com.movietheater.common.annotation.RestApiErrorResponse;
import com.movietheater.common.annotation.RestApiErrorResponses;
import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.MessageConst;
import com.movietheater.common.constant.RouteConst;
import com.movietheater.common.exception.ResourceNotFoundException;
import com.movietheater.common.exception.dto.ErrorResponseBody;
import com.movietheater.schedulemanagement.dto.request.ShowtimeCreateRequest;
import com.movietheater.schedulemanagement.dto.request.UpdateShowtimeRequest;
import com.movietheater.schedulemanagement.dto.response.ShowtimeResponse;
import com.movietheater.schedulemanagement.service.ShowtimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for managing showtimes in the movie theater application.
 */
@RestController
@RequestMapping(RouteConst.ADMIN_BASE)
@RequiredArgsConstructor
public class ShowtimeController {
    private static final Logger logger = LoggerFactory.getLogger(ShowtimeController.class);
    private static final int DEFAULT_PAGE_SIZE = 5;

    private final ShowtimeService showtimeService;

    /**
     * Retrieves showtimes with optional filters for movie title, date, and room name.
     *
     * @param movieTitle the movie title to filter by (optional)
     * @param date the date to filter by in format yyyy-MM-dd (optional)
     * @param roomName the room name to filter by (optional)
     * @param page the page number (default: 0)
     * @param size the page size (default: 5)
     * @return a ResponseEntity containing a page of ShowtimeResponse objects
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @GetMapping(RouteConst.SHOWTIME)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid date format",
            code = MessageConst.ERROR_INVALID_DATE,
            on = @RestApiErrorResponse.Exception(DateTimeParseException.class)
        )
    })
    public ResponseEntity<Page<ShowtimeResponse>> getShowtimes(
            @RequestParam(required = false) String movieTitle,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String roomName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        logger.info("Fetching showtimes with filters - movieTitle: {}, date: {}, roomName: {}, page: {}, size: {}", 
            movieTitle, date, roomName, page, size);
        Page<ShowtimeResponse> showtimes = showtimeService.getShowtimesWithFilters(movieTitle, date, roomName, page, size);
        logger.debug("Found {} showtimes for page {}", showtimes.getTotalElements(), page);
        return ResponseEntity.ok(showtimes);
    }

    /**
     * Retrieves a single showtime by its ID.
     *
     * @param scheduleId the ID of the showtime to retrieve
     * @return a ResponseEntity containing the ShowtimeResponse
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @GetMapping(RouteConst.SHOWTIME_DETAIL)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Showtime not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        )
    })
    public ResponseEntity<ShowtimeResponse> getShowtimeById(@PathVariable String scheduleId) {
        logger.info("Fetching showtime with scheduleId: {}", scheduleId);
        ShowtimeResponse showtime = showtimeService.getShowtimeById(scheduleId);
        logger.debug("Retrieved showtime: {}", scheduleId);
        return ResponseEntity.ok(showtime);
    }

    /**
     * Creates a new showtime.
     *
     * @param request the ShowtimeCreateRequest containing showtime details
     * @return a ResponseEntity containing the created ShowtimeResponse
     */
    @PreAuthorize(AuthorityConst.AUTH_ROLE_ADMIN)
    @PostMapping(RouteConst.SHOWTIME)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Movie not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Room not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Theater not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.CONFLICT,
            message = "Room capacity insufficient",
            code = "E2005",
            on = @RestApiErrorResponse.Exception(IllegalStateException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.CONFLICT,
            message = "Scheduling conflict",
            code = "E2006",
            on = @RestApiErrorResponse.Exception(IllegalStateException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.CONFLICT,
            message = "Maximum showtime limit reached",
            code = "E2008",
            on = @RestApiErrorResponse.Exception(IllegalStateException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid showtime format",
            code = MessageConst.ERROR_INVALID_DATE,
            on = @RestApiErrorResponse.Exception(IllegalArgumentException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid request data",
            code = "E2007",
            on = @RestApiErrorResponse.Exception(MethodArgumentNotValidException.class)
        )
    })
    public ResponseEntity<ShowtimeResponse> createShowtime(@Valid @RequestBody ShowtimeCreateRequest request) {
        logger.info("Creating new showtime for movieId: {}, roomId: {}, theaterId: {}, showtime: {}", 
            request.getMovieId(), request.getRoomId(), request.getTheaterId(), request.getShowtime());
        ShowtimeResponse createdShowtime = showtimeService.createShowtime(request);
        logger.debug("Showtime created successfully: {}", createdShowtime.getScheduleId());
        return ResponseEntity.ok(createdShowtime);
    }

    /**
     * Updates an existing showtime.
     *
     * @param scheduleId the ID of the showtime to update
     * @param request the UpdateShowtimeRequest containing updated showtime details
     * @return a ResponseEntity containing the updated ShowtimeResponse
     */
    @PreAuthorize(AuthorityConst.AUTH_ROLE_ADMIN)
    @PutMapping(RouteConst.SHOWTIME_DETAIL)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Showtime not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Movie not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Room not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Theater not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.CONFLICT,
            message = "Room capacity insufficient",
            code = "E2005",
            on = @RestApiErrorResponse.Exception(IllegalStateException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.CONFLICT,
            message = "Scheduling conflict",
            code = "E2006",
            on = @RestApiErrorResponse.Exception(IllegalStateException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid showtime format",
            code = MessageConst.ERROR_INVALID_DATE,
            on = @RestApiErrorResponse.Exception(IllegalArgumentException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid request data",
            code = "E2007",
            on = @RestApiErrorResponse.Exception(MethodArgumentNotValidException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.CONFLICT,
            message = "Showtime has existing bookings",
            code = "E2009",
            on = @RestApiErrorResponse.Exception(IllegalStateException.class)
        )
    })
    public ResponseEntity<ShowtimeResponse> updateShowtime(
            @PathVariable String scheduleId,
            @Valid @RequestBody UpdateShowtimeRequest request) {
        logger.info("Updating showtime with scheduleId: {}", scheduleId);
        ShowtimeResponse updatedShowtime = showtimeService.updateShowtime(scheduleId, request);
        logger.debug("Showtime updated successfully: {}", scheduleId);
        return ResponseEntity.ok(updatedShowtime);
    }

    /**
     * Deletes a showtime by its ID.
     *
     * @param scheduleId the ID of the showtime to delete
     * @return a ResponseEntity with no content
     */
    @PreAuthorize(AuthorityConst.AUTH_ROLE_ADMIN)
    @DeleteMapping(RouteConst.SHOWTIME_DETAIL)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Showtime not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.CONFLICT,
            message = "Cannot delete future showtime with active bookings",
            code = "E2010",
            on = @RestApiErrorResponse.Exception(IllegalStateException.class)
        )
    })
    public ResponseEntity<Void> deleteShowtime(@PathVariable String scheduleId) {
        logger.info("Deleting showtime with scheduleId: {}", scheduleId);
        showtimeService.deleteShowtime(scheduleId);
        logger.debug("Showtime deleted successfully: {}", scheduleId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Handles validation exceptions for invalid request data.
     *
     * @param ex the MethodArgumentNotValidException containing validation errors
     * @return a ResponseEntity containing an ErrorResponseBody with validation error details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseBody> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        ErrorResponseBody errorResponse = ErrorResponseBody.builder()
                .code("E2007")
                .message("Invalid request data")
                .originMessage(errors.toString())
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}