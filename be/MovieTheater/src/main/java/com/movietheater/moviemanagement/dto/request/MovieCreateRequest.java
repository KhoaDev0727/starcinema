package com.movietheater.moviemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MovieCreateRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @Size(max = 500, message = "Short description cannot exceed 500 characters")
    private String shortDescription;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Size(max = 100, message = "Director cannot exceed 100 characters")
    private String director;

    @Size(max = 1000, message = "Actors cannot exceed 1000 characters")
    private String actors;

    @Size(max = 100, message = "Genre cannot exceed 100 characters")
    private String genre;

    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Release date must be in format YYYY-MM-DD")
    private String releaseDate;

    @Positive(message = "Duration must be positive")
    private Integer duration;

    @Size(max = 50, message = "Language cannot exceed 50 characters")
    private String language;

    @Size(max = 10, message = "Rated cannot exceed 10 characters")
    private String rated;

    @Pattern(regexp = "^/images/.*\\.(png|jpg|jpeg)$", message = "Poster URL must be a valid image path")
    private String posterUrl;
} 