package com.movietheater.booking.dto.response;

import com.movietheater.entity.Movie;
import com.movietheater.entity.MovieMedia;
import com.movietheater.common.constant.CommonConst;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;

import java.util.List;

/**
 * Data Transfer Object for returning movie data.
 */
@Data
@Slf4j
public class MovieResponse {
    private String movieId;
    private String title;
    private String shortDescription;
    private String description;
    private String director;
    private String actors;
    private String genre;
    private String releaseDate;
    private Integer duration;
    private String language;
    private String rated;
    private String posterUrl;
    private String ratingLabel;
    private String ranking;
    private String likes;

    /**
     * Converts a Movie entity to a MovieResponse.
     *
     * @param movie the Movie entity
     * @return the converted MovieResponse
     */
    public static MovieResponse fromEntity(Movie movie) {
        log.info("Mapping Movie entity to MovieResponse for movieId: {}", movie.getMovieId());
        MovieResponse response = new MovieResponse();
        try {
            BeanUtils.copyProperties(movie, response);
            List<MovieMedia> mediaList = movie.getMovieMedia();
            if (mediaList != null) {
                MovieMedia posterMedia = mediaList.stream()
                    .filter(media -> CommonConst.MEDIA_TYPE_IMAGE.equals(media.getMediaType()))
                    .findFirst()
                    .orElse(null);
                if (posterMedia != null) {
                    response.setPosterUrl(posterMedia.getMediaUrl());
                    log.debug("Poster URL set for movieId: {}", movie.getMovieId());
                }
            }
            if (movie.getReleaseDate() != null) {
                response.setReleaseDate(movie.getReleaseDate().toString());
            }
            log.debug("Successfully mapped Movie to MovieResponse for movieId: {}", movie.getMovieId());
        } catch (Exception e) {
            log.error("Error mapping Movie to MovieResponse: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to map Movie to MovieResponse", e);
        }
        return response;
    }
}