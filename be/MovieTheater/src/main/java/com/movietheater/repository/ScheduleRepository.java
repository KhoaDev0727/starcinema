package com.movietheater.repository;

import com.movietheater.entity.Schedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, String> {
    List<Schedule> findByMovieId(String movieId);

    @Query("SELECT s FROM Schedule s " +
           "JOIN Movie m ON s.movieId = m.movieId " +
           "JOIN Room r ON s.roomId = r.roomId " +
           "WHERE (:movieTitle IS NULL OR m.title LIKE %:movieTitle%) " +
           "AND (:date IS NULL OR CAST(s.showtime AS DATE) = :date) " +
           "AND (:roomName IS NULL OR r.roomName LIKE %:roomName%)")
    Page<Schedule> findShowtimesWithFilters(
        @Param("movieTitle") String movieTitle,
        @Param("date") LocalDate date,
        @Param("roomName") String roomName,
        Pageable pageable);

    List<Schedule> findByTheaterId(String theaterId);

    @Query("SELECT s FROM Schedule s WHERE s.scheduleId = :scheduleId")
    Optional<Schedule> findByScheduleId(@Param("scheduleId") String scheduleId);

    long count();

    long countByShowtimeBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}