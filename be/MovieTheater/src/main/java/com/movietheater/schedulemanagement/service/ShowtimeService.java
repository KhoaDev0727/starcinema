package com.movietheater.schedulemanagement.service;

import com.movietheater.schedulemanagement.dto.request.ShowtimeCreateRequest;
import com.movietheater.schedulemanagement.dto.request.UpdateShowtimeRequest;
import com.movietheater.schedulemanagement.dto.response.ShowtimeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

/**
 * Service interface for managing showtimes in the movie theater application.
 */
public interface ShowtimeService {
    /**
     * Retrieves showtimes with optional filters.
     *
     * @param movieTitle the movie title to filter by (optional)
     * @param date the date to filter by in format yyyy-MM-dd (optional)
     * @param roomName the room name to filter by (optional)
     * @param pageable pagination information
     * @return a page of ShowtimeResponse objects
     */
    Page<ShowtimeResponse> getShowtimes(String movieTitle, LocalDate date, String roomName, Pageable pageable);

    /**
     * Retrieves showtimes with optional filters and pagination parameters.
     *
     * @param movieTitle the movie title to filter by (optional)
     * @param date the date to filter by in format yyyy-MM-dd (optional)
     * @param roomName the room name to filter by (optional)
     * @param page the page number (default: 0)
     * @param size the page size (default: 5)
     * @return a page of ShowtimeResponse objects
     */
    Page<ShowtimeResponse> getShowtimesWithFilters(String movieTitle, String date, String roomName, int page, int size);

    /**
     * Retrieves a single showtime by its ID.
     *
     * @param scheduleId the ID of the showtime to retrieve
     * @return the ShowtimeResponse object
     */
    ShowtimeResponse getShowtimeById(String scheduleId);

    /**
     * Deletes a showtime by its ID.
     *
     * @param scheduleId the ID of the showtime to delete
     */
    void deleteShowtime(String scheduleId);

    /**
     * Creates a new showtime.
     *
     * @param request the ShowtimeCreateRequest containing showtime details
     * @return the created ShowtimeResponse
     */
    ShowtimeResponse createShowtime(ShowtimeCreateRequest request);

    /**
     * Updates an existing showtime.
     *
     * @param scheduleId the ID of the showtime to update
     * @param request the UpdateShowtimeRequest containing updated showtime details
     * @return the updated ShowtimeResponse
     */
    ShowtimeResponse updateShowtime(String scheduleId, UpdateShowtimeRequest request);
}