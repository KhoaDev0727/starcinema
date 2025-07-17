package com.movietheater.repository;

import com.movietheater.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TheaterRepository extends JpaRepository<Theater, String> {
    @Query("SELECT t FROM Theater t WHERE t.location.locationName = :city")
    List<Theater> findByCity(String city);

    @Query("SELECT t FROM Theater t WHERE t.location.locationId = :locationId")
    List<Theater> findByLocationId(String locationId);
    
    List<Theater> findAll(); 
    
    @Query("SELECT DISTINCT t.location.locationName FROM Theater t WHERE t.location IS NOT NULL")
    List<String> findDistinctCities();
}