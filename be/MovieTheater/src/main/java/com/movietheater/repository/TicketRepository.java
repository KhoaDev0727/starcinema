package com.movietheater.repository;

import com.movietheater.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    List<Ticket> findAllByOrderByTicketIdAsc();
    void deleteByScheduleId(String scheduleId);
}
