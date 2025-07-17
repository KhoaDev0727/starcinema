package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "MOVIE_MEDIA")
@Data
public class MovieMedia {
    @Id
    @Column(name = "MEDIA_ID")
    private String mediaId;

    @ManyToOne
    @JoinColumn(name = "MOVIE_ID")
    private Movie movie;

    @Column(name = "MEDIA_TYPE")
    private String mediaType;

    @Column(name = "URL") // Changed from MEDIA_URL to match the database schema
    private String mediaUrl;

    @Column(name = "DESCRIPTION")
    private String description; // Added to match the database schema
}