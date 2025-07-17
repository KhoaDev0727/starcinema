package com.movietheater.repository;

import com.movietheater.entity.ScheduleSeat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleSeatRepository extends JpaRepository<ScheduleSeat, String> {
    List<ScheduleSeat> findByScheduleId(String scheduleId);
    void deleteByScheduleId(String scheduleId);
}