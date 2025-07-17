package com.movietheater.moviemanagement.service;

import com.movietheater.moviemanagement.dto.request.MovieCreateRequest;
import com.movietheater.moviemanagement.dto.request.MovieUpdateRequest;
import com.movietheater.moviemanagement.dto.response.MovieResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing movies.
 */
public interface MovieService {
    /**
     * Retrieves all movies with optional filters (no pagination).
     *
     * @param title the movie title to filter by (optional)
     * @param genre the genre to filter by (optional)
     * @param releaseDate the release date to filter by (optional, format: YYYY-MM-DD)
     * @return a list of movie responses
     */
    List<MovieResponse> getAllMovies(String title, String genre, String releaseDate);

    /**
     * Retrieves movies with optional filters and pagination.
     *
     * @param title the movie title to filter by (optional)
     * @param genre the genre to filter by (optional)
     * @param releaseDate the release date to filter by (optional, format: YYYY-MM-DD)
     * @param pageable pagination information
     * @return a page of movie responses
     */
    Page<MovieResponse> getMovies(String title, String genre, String releaseDate, Pageable pageable);

    /**
     * Creates a new movie.
     *
     * @param request the request containing movie details
     * @return the created movie response
     */
    MovieResponse createMovie(MovieCreateRequest request);

    /**
     * Updates an existing movie by its ID.
     *
     * @param movieId the ID of the movie to update
     * @param request the request containing updated movie details
     * @return the updated movie response
     */
    MovieResponse updateMovie(String movieId, MovieUpdateRequest request);

    /**
     * Deletes a movie by its ID.
     *
     * @param movieId the ID of the movie to delete
     */
    void deleteMovie(String movieId);
}