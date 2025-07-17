package com.movietheater.schedulemanagement.controller;

import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.RouteConst;
import com.movietheater.entity.Theater;
import com.movietheater.repository.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for managing theaters in the movie theater application.
 */
@RestController
@RequestMapping(RouteConst.ADMIN_BASE)
@RequiredArgsConstructor
public class TheaterController {
    private static final Logger logger = LoggerFactory.getLogger(TheaterController.class);

    private final TheaterRepository theaterRepository;

    /**
     * Retrieves all theaters with valid IDs and names.
     *
     * @return a ResponseEntity containing a list of Theater entities
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @GetMapping(RouteConst.THEATER)
    public ResponseEntity<List<Theater>> getAllTheaters() {
        logger.info("Fetching all theaters");
        List<Theater> theaters = theaterRepository.findAll()
            .stream()
            .filter(theater -> theater.getTheaterId() != null && theater.getTheaterName() != null)
            .collect(Collectors.toList());
        logger.debug("Found {} theaters", theaters.size());
        return ResponseEntity.ok(theaters);
    }
}