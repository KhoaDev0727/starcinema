package com.movietheater.ticketmanagement.service;

import com.movietheater.ticketmanagement.dto.TicketResponseDTO;

import java.util.List;

public interface TicketService {
    List<TicketResponseDTO> getAllTickets();
}
