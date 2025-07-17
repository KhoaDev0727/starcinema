package com.movietheater.ticketmanagement.service.impl;

import com.movietheater.ticketmanagement.dto.TicketResponseDTO;
import com.movietheater.entity.*;
import com.movietheater.repository.*;
import com.movietheater.ticketmanagement.service.TicketService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public List<TicketResponseDTO> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAllByOrderByTicketIdAsc();

        return tickets.stream().map(ticket -> {
            Schedule schedule = scheduleRepository.findById(ticket.getScheduleId()).orElse(null);
            if (schedule == null) {
                return null;
            }

            Room room = roomRepository.findById(schedule.getRoomId()).orElse(null);
            Theater theater = theaterRepository.findById(schedule.getTheaterId()).orElse(null);
            User user = userRepository.findById(ticket.getUserId()).orElse(null);
            Movie movie = movieRepository.findById(schedule.getMovieId()).orElse(null);

            return new TicketResponseDTO(
                    ticket.getTicketId(),
                    ticket.getUserId(),
                    user != null ? user.getFullName() : null,
                    schedule.getMovieId(),
                    movie != null ? movie.getTitle() : null,
                    theater != null ? theater.getTheaterName() : null,
                    theater != null && theater.getLocation() != null ? theater.getLocation().getLocationName() : null,

                    room != null ? room.getRoomName() : null,
                    ticket.getSeatId(),
                    schedule.getShowtime(), // now matches LocalDateTime
                    ticket.getPrice(),
                    ticket.getBookingDate(),
                    ticket.getStatus());
        }).filter(dto -> dto != null).collect(Collectors.toList());
    }
}
