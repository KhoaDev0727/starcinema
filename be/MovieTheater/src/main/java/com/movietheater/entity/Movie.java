package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "MOVIES")
@Data
public class Movie {
    @Id
    @Column(name = "MOVIE_ID")
    private String movieId;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Column(name = "SHORT_DESCRIPTION", length = 500)
    private String shortDescription;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "DIRECTOR")
    private String director;

    @Column(name = "ACTORS", length = 1000)
    private String actors;

    @Column(name = "GENRE")
    private String genre;

    @Column(name = "RELEASE_DATE")
    private LocalDate releaseDate;

    @Column(name = "DURATION")
    private Integer duration;

    @Column(name = "LANGUAGE")
    private String language;

    @Column(name = "RATED")
    private String rated;

    @Transient
    private String posterUrl;

    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<MovieMedia> movieMedia;

}