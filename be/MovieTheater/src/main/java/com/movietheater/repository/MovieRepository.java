package com.movietheater.repository;

import com.movietheater.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, String> {
    @Query("SELECT m FROM Movie m LEFT JOIN FETCH m.movieMedia mm WHERE mm.mediaType = 'image' AND mm.mediaUrl IS NOT NULL AND (LOWER(m.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(m.genre) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Movie> searchMovies(@Param("searchTerm") String searchTerm);

    @Query("SELECT m FROM Movie m LEFT JOIN FETCH m.movieMedia mm WHERE mm.mediaType = 'image' AND mm.mediaUrl IS NOT NULL AND (LOWER(m.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND LOWER(m.genre) = LOWER(:genre)")
    List<Movie> searchMoviesByGenre(@Param("searchTerm") String searchTerm, @Param("genre") String genre);

    @Query("SELECT m FROM Movie m LEFT JOIN FETCH m.movieMedia")
    List<Movie> findAllWithPosters();
    
    @Query("SELECT MAX(m.movieId) FROM Movie m WHERE m.movieId LIKE 'M%'")
    String findMaxMovieId();

    long count();
}
