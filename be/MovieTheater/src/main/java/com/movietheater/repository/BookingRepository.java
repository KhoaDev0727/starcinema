package com.movietheater.repository;

import com.movietheater.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserId(Long userId);
    void deleteByScheduleId(String scheduleId);
    List<Booking> findByOrderId(String orderId);
    long countByStatus(String status);
}