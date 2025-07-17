package com.movietheater.repository;

import com.movietheater.entity.MovieMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MovieMediaRepository extends JpaRepository<MovieMedia, String> {
    @Query("SELECT MAX(m.mediaId) FROM MovieMedia m WHERE m.mediaId LIKE 'MM%'")
    String findMaxMediaId();
}
