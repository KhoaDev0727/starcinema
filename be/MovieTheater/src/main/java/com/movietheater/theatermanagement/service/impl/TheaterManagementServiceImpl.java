package com.movietheater.theatermanagement.service.impl;

import com.movietheater.theatermanagement.dto.request.TheaterCreateRequest;
import com.movietheater.theatermanagement.dto.request.TheaterUpdateRequest;
import com.movietheater.theatermanagement.dto.response.TheaterResponse;
import com.movietheater.theatermanagement.dto.response.LocationItemDTO;
import com.movietheater.theatermanagement.dto.response.ScheduleResponse;
import com.movietheater.entity.Theater;
import com.movietheater.entity.Location;
import com.movietheater.entity.Movie;
import com.movietheater.entity.Schedule;
import com.movietheater.entity.Room;
import com.movietheater.repository.TheaterRepository;
import com.movietheater.repository.ScheduleRepository;
import com.movietheater.repository.MovieRepository;
import com.movietheater.repository.LocationRepository;
import com.movietheater.repository.RoomRepository;
import com.movietheater.theatermanagement.service.TheaterManagementService;
import com.movietheater.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

/**
 * Implementation of the TheaterManagementService interface for managing theaters.
 */
@Service
public class TheaterManagementServiceImpl implements TheaterManagementService {
    private static final Logger logger = LoggerFactory.getLogger(TheaterManagementServiceImpl.class);
    private final TheaterRepository theaterRepository;
    private final ScheduleRepository scheduleRepository;
    private final MovieRepository movieRepository;
    private final LocationRepository locationRepository;
    private final RoomRepository roomRepository;

    public TheaterManagementServiceImpl(TheaterRepository theaterRepository, ScheduleRepository scheduleRepository,
                                       MovieRepository movieRepository, LocationRepository locationRepository,
                                       RoomRepository roomRepository) {
        this.theaterRepository = theaterRepository;
        this.scheduleRepository = scheduleRepository;
        this.movieRepository = movieRepository;
        this.locationRepository = locationRepository;
        this.roomRepository = roomRepository;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<TheaterResponse> getTheaters(String name, String location) {
        List<Theater> all = theaterRepository.findAll();
        return all.stream()
            .filter(t -> name == null || t.getTheaterName().toLowerCase().contains(name.toLowerCase()))
            .filter(t -> location == null || (t.getLocation() != null && t.getLocation().getLocationName().toLowerCase().contains(location.toLowerCase())))
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<String> getAllLocations() {
        return locationRepository.findAll().stream()
            .map(Location::getLocationName)
            .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<TheaterResponse> getTheatersByLocationId(String locationId) {
        return theaterRepository.findByLocationId(locationId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<LocationItemDTO> getAllLocationItems() {
        return locationRepository.findAll().stream()
            .map(l -> new LocationItemDTO(l.getLocationId(), l.getLocationName()))
            .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByTheaterId(String theaterId) {
        logger.info("Fetching schedules for theaterId: {}", theaterId);
        List<Schedule> schedules = scheduleRepository.findByTheaterId(theaterId);
        
        // Create caches for movie and room data to avoid N+1 queries
        Map<String, String> movieCache = new HashMap<>();
        Map<String, String> roomCache = new HashMap<>();
        
        return schedules.stream()
            .map(schedule -> convertToScheduleResponse(schedule, movieCache, roomCache))
            .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public TheaterResponse createTheater(TheaterCreateRequest request) {
        Theater theater = new Theater();
        theater.setTheaterName(request.getTheaterName());
        theater.setPhoneNumber(request.getPhoneNumber());
        // Gán Location
        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));
        theater.setLocation(location);
        Theater saved = theaterRepository.save(theater);
        return toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public TheaterResponse updateTheater(String theaterId, TheaterUpdateRequest request) {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found"));
        if (request.getTheaterName() != null) theater.setTheaterName(request.getTheaterName());
        if (request.getPhoneNumber() != null) theater.setPhoneNumber(request.getPhoneNumber());
        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location not found"));
            theater.setLocation(location);
        }
        Theater updated = theaterRepository.save(theater);
        return toResponse(updated);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteTheater(String theaterId) {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found"));
        theaterRepository.delete(theater);
    }

    /**
     * Chuyển đổi Theater entity sang TheaterResponse DTO.
     *
     * @param theater the theater entity
     * @return the theater response DTO
     */
    private TheaterResponse toResponse(Theater theater) {
        TheaterResponse dto = new TheaterResponse();
        dto.setTheaterId(theater.getTheaterId());
        dto.setTheaterName(theater.getTheaterName());
        dto.setPhoneNumber(theater.getPhoneNumber());
        dto.setLocationName(theater.getLocation() != null ? theater.getLocation().getLocationName() : null);
        return dto;
    }

    /**
     * Chuyển đổi Schedule entity sang ScheduleResponse DTO.
     *
     * @param schedule the schedule entity
     * @param movieCache cache for movie data
     * @param roomCache cache for room data
     * @return the schedule response DTO
     */
    private ScheduleResponse convertToScheduleResponse(Schedule schedule, Map<String, String> movieCache, Map<String, String> roomCache) {
        Movie movie = movieRepository.findById(schedule.getMovieId()).orElse(null);
        
        return ScheduleResponse.builder()
            .scheduleId(schedule.getScheduleId())
            .movieId(schedule.getMovieId())
            .roomId(schedule.getRoomId())
            .theaterId(schedule.getTheaterId())
            .movieTitle(movieCache.computeIfAbsent(schedule.getMovieId(), id ->
                movieRepository.findById(id).map(Movie::getTitle).orElse("Unknown")))
            .showtime(schedule.getShowtime().toString())
            .price(schedule.getPrice())
            .totalSeats(schedule.getTotalSeats())
            .availableSeats(schedule.getAvailableSeats())
            .posterUrl(movie != null ? movie.getPosterUrl() : null)
            .build();
    }
}