package com.movietheater.theatermanagement.service;

import com.movietheater.theatermanagement.dto.request.TheaterCreateRequest;
import com.movietheater.theatermanagement.dto.request.TheaterUpdateRequest;
import com.movietheater.theatermanagement.dto.response.TheaterResponse;
import com.movietheater.theatermanagement.dto.response.LocationItemDTO;
import com.movietheater.theatermanagement.dto.response.ScheduleResponse;
import java.util.List;

/**
 * Service interface for managing theaters.
 */
public interface TheaterManagementService {
    /**
     * Retrieves theaters with optional filters.
     *
     * @param name the theater name to filter by (optional)
     * @param location the location name to filter by (optional)
     * @return a list of theater responses
     */
    List<TheaterResponse> getTheaters(String name, String location);

    /**
     * Retrieves all unique locations.
     *
     * @return a list of location names
     */
    List<String> getAllLocations();

    /**
     * Retrieves all location items.
     *
     * @return a list of location item DTOs
     */
    List<LocationItemDTO> getAllLocationItems();

    /**
     * Retrieves theaters by location ID.
     *
     * @param locationId the location ID
     * @return a list of theater responses
     */
    List<TheaterResponse> getTheatersByLocationId(String locationId);

    /**
     * Retrieves schedules by theater ID.
     *
     * @param theaterId the theater ID
     * @return a list of schedule DTOs
     */
    List<ScheduleResponse> getSchedulesByTheaterId(String theaterId); 

    /**
     * Creates a new theater.
     *
     * @param request the request containing theater details
     * @return the created theater response
     */
    TheaterResponse createTheater(TheaterCreateRequest request);

    /**
     * Updates an existing theater by its ID.
     *
     * @param theaterId the ID of the theater to update
     * @param request the request containing updated theater details
     * @return the updated theater response
     */
    TheaterResponse updateTheater(String theaterId, TheaterUpdateRequest request);

    /**
     * Deletes a theater by its ID.
     *
     * @param theaterId the ID of the theater to delete
     */
    void deleteTheater(String theaterId);
}