package com.movietheater.repository;

import com.movietheater.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, String> {
    Location findByLocationName(String locationName);
}