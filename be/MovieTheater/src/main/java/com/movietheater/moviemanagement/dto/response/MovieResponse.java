package com.movietheater.moviemanagement.dto.response;

import lombok.Data;

@Data
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
} 