package com.movietheater.schedulemanagement.controller;

import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.RouteConst;
import com.movietheater.entity.Room;
import com.movietheater.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing rooms in the movie theater application.
 */
@RestController
@RequestMapping(RouteConst.ADMIN_BASE)
@RequiredArgsConstructor
public class RoomController {
    private static final Logger logger = LoggerFactory.getLogger(RoomController.class);

    private final RoomRepository roomRepository;

    /**
     * Retrieves all rooms.
     *
     * @return a ResponseEntity containing a list of Room entities
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @GetMapping(RouteConst.ROOM)
    public ResponseEntity<List<Room>> getAllRooms() {
        logger.info("Fetching all rooms");
        List<Room> rooms = roomRepository.findAll();
        logger.debug("Retrieved {} rooms", rooms.size());
        return ResponseEntity.ok(rooms);
    }
}