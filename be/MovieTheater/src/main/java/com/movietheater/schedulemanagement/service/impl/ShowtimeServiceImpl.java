package com.movietheater.schedulemanagement.service.impl;

import com.movietheater.common.constant.CommonConst;
import com.movietheater.common.exception.ResourceNotFoundException;
import com.movietheater.entity.Room;
import com.movietheater.entity.Schedule;
import com.movietheater.entity.ScheduleSeat;
import com.movietheater.repository.BookingRepository;
import com.movietheater.repository.MovieRepository;
import com.movietheater.repository.RoomRepository;
import com.movietheater.repository.ScheduleRepository;
import com.movietheater.repository.ScheduleSeatRepository;
import com.movietheater.repository.TheaterRepository;
import com.movietheater.schedulemanagement.dto.request.ShowtimeCreateRequest;
import com.movietheater.schedulemanagement.dto.request.UpdateShowtimeRequest;
import com.movietheater.schedulemanagement.dto.response.ShowtimeResponse;
import com.movietheater.schedulemanagement.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementation of the ShowtimeService interface for managing showtimes.
 */
@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {
    private static final Logger logger = LoggerFactory.getLogger(ShowtimeServiceImpl.class);

    private final ScheduleRepository scheduleRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final ScheduleSeatRepository scheduleSeatRepository;
    private final TheaterRepository theaterRepository;
    private final BookingRepository bookingRepository;

    @Override
    public Page<ShowtimeResponse> getShowtimes(String movieTitle, LocalDate date, String roomName, Pageable pageable) {
        logger.info("Fetching showtimes with filters - movieTitle: {}, date: {}, roomName: {}, pageable: {}", 
            movieTitle, date, roomName, pageable);
        
        Map<String, String> movieCache = new HashMap<>();
        Map<String, String> roomCache = new HashMap<>();
        Page<Schedule> schedules = scheduleRepository.findShowtimesWithFilters(movieTitle, date, roomName, pageable);
        logger.info("Found {} showtimes", schedules.getTotalElements());
        
        return schedules.map(schedule -> convertToDTO(schedule, movieCache, roomCache));
    }

    @Override
    public Page<ShowtimeResponse> getShowtimesWithFilters(String movieTitle, String date, String roomName, int page, int size) {
        logger.info("Fetching showtimes with filters - movieTitle: {}, date: {}, roomName: {}, page: {}, size: {}", 
            movieTitle, date, roomName, page, size);
        
        LocalDate parsedDate = null;
        if (date != null && !date.trim().isEmpty()) {
            try {
                parsedDate = LocalDate.parse(date);
            } catch (DateTimeParseException e) {
                logger.warn("Invalid date format: {}", date);
                throw e;
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "showtime"));
        return getShowtimes(movieTitle, parsedDate, roomName, pageable);
    }

    @Override
    public ShowtimeResponse getShowtimeById(String scheduleId) {
        logger.info("Fetching showtime with scheduleId: {}", scheduleId);
        Optional<Schedule> scheduleOpt = scheduleRepository.findByScheduleId(scheduleId);
        if (scheduleOpt.isEmpty()) {
            logger.warn("Showtime not found: {}", scheduleId);
            throw new ResourceNotFoundException("Showtime not found with ID: " + scheduleId);
        }
        return convertToDTO(scheduleOpt.get(), new HashMap<>(), new HashMap<>());
    }

    @Transactional
    public void deleteShowtime(String scheduleId) {
        logger.info("Deleting showtime with scheduleId: {}", scheduleId);
        Optional<Schedule> scheduleOpt = scheduleRepository.findByScheduleId(scheduleId);
        if (scheduleOpt.isEmpty()) {
            logger.warn("Showtime not found: {}", scheduleId);
            throw new ResourceNotFoundException("Showtime not found with ID: " + scheduleId);
        }

        Schedule schedule = scheduleOpt.get();
        LocalDateTime currentTime = LocalDateTime.now();

        // Check for existing bookings
        List<ScheduleSeat> bookedSeats = scheduleSeatRepository.findByScheduleId(scheduleId)
                .stream()
                .filter(seat -> CommonConst.SEAT_STATUS_BOOKED.equals(seat.getSeatStatus()))
                .toList();
        
        if (!bookedSeats.isEmpty()) {
            logger.warn("Showtime {} has existing bookings", scheduleId);
            throw new IllegalStateException("Cannot delete future showtime with active bookings");
        }

        // Delete associated schedule seats
        scheduleSeatRepository.deleteByScheduleId(scheduleId);
        
        // Delete associated bookings (if any, for consistency)
        bookingRepository.deleteByScheduleId(scheduleId);
        
        // Delete the showtime
        scheduleRepository.deleteById(scheduleId);
        logger.debug("Showtime deleted successfully: {}", scheduleId);
    }


    @Override
    @Transactional
    public ShowtimeResponse createShowtime(ShowtimeCreateRequest request) {
        logger.info("Creating new showtime with payload: {}", request);
        
        // Check maximum showtime limit
        long currentShowtimeCount = scheduleRepository.count();
        if (currentShowtimeCount >= CommonConst.MAX_SHOWTIMES) {
            logger.warn("Maximum showtime limit reached: {}", CommonConst.MAX_SHOWTIMES);
            throw new IllegalStateException("Maximum showtime limit of " + CommonConst.MAX_SHOWTIMES + " reached");
        }

        // Validate movie
        Optional<com.movietheater.entity.Movie> movie = movieRepository.findById(request.getMovieId());
        if (movie.isEmpty()) {
            logger.warn("Movie not found: {}", request.getMovieId());
            throw new ResourceNotFoundException("Movie not found with ID: " + request.getMovieId());
        }

        // Validate room
        Optional<Room> room = roomRepository.findById(request.getRoomId());
        if (room.isEmpty()) {
            logger.warn("Room not found: {}", request.getRoomId());
            throw new ResourceNotFoundException("Room not found with ID: " + request.getRoomId());
        }
        if (room.get().getCapacity() < CommonConst.TOTAL_SEATS) {
            logger.warn("Room capacity {} is less than required {} seats", room.get().getCapacity(), CommonConst.TOTAL_SEATS);
            throw new IllegalStateException("Room capacity must be at least " + CommonConst.TOTAL_SEATS + " seats");
        }

        // Validate theater
        Optional<com.movietheater.entity.Theater> theater = theaterRepository.findById(request.getTheaterId());
        if (theater.isEmpty()) {
            logger.warn("Theater not found: {}", request.getTheaterId());
            throw new ResourceNotFoundException("Theater not found with ID: " + request.getTheaterId());
        }

        // Validate price
        if (request.getPrice().compareTo(CommonConst.PRICE_MIN) < 0 || request.getPrice().compareTo(CommonConst.PRICE_MAX) > 0) {
            logger.warn("Price {} is out of allowed range [{} - {}]", request.getPrice(), CommonConst.PRICE_MIN, CommonConst.PRICE_MAX);
            throw new IllegalArgumentException("Price must be between " + CommonConst.PRICE_MIN + " and " + CommonConst.PRICE_MAX);
        }

        // Parse showtime
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        LocalDateTime showtime;
        try {
            showtime = LocalDateTime.parse(request.getShowtime(), formatter);
        } catch (DateTimeParseException e) {
            logger.warn("Invalid showtime format: {}", request.getShowtime());
            throw new IllegalArgumentException("Invalid showtime format: " + request.getShowtime());
        }

        // Validate scheduling conflict
        validateNoSchedulingConflict(request.getRoomId(), showtime, null);

        // Create schedule using builder
        String scheduleId = "SCH" + UUID.randomUUID().toString().replace("-", "").substring(0, 29);
        long scheduleCount = scheduleRepository.count();
        String shortScheduleId = String.format("S%03d", scheduleCount + 1);
        Schedule schedule = Schedule.builder()
            .scheduleId(scheduleId)
            .movieId(request.getMovieId())
            .roomId(request.getRoomId())
            .theaterId(request.getTheaterId())
            .showtime(showtime)
            .price(request.getPrice())
            .totalSeats(CommonConst.TOTAL_SEATS)
            .availableSeats(CommonConst.TOTAL_SEATS)
            .build();

        scheduleRepository.save(schedule);
        logger.info("Showtime created successfully: {}, shortScheduleId: {}", scheduleId, shortScheduleId);

        // Create seats
        createScheduleSeats(scheduleId, shortScheduleId);

        return convertToDTO(schedule, new HashMap<>(), new HashMap<>());
    }

    @Override
    @Transactional
    public ShowtimeResponse updateShowtime(String scheduleId, UpdateShowtimeRequest request) {
        logger.info("Updating showtime with scheduleId: {}", scheduleId);

        // Validate showtime exists
        Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleId);
        if (scheduleOpt.isEmpty()) {
            logger.warn("Showtime not found: {}", scheduleId);
            throw new ResourceNotFoundException("Showtime not found with ID: " + scheduleId);
        }
        Schedule schedule = scheduleOpt.get();

        // Check for existing bookings
        List<ScheduleSeat> bookedSeats = scheduleSeatRepository.findByScheduleId(scheduleId)
                .stream()
                .filter(seat -> CommonConst.SEAT_STATUS_BOOKED.equals(seat.getSeatStatus()))
                .toList();
        if (!bookedSeats.isEmpty()) {
            logger.warn("Showtime {} has existing bookings", scheduleId);
            throw new IllegalStateException("Showtime has existing bookings");
        }

        // Validate movie
        Optional<com.movietheater.entity.Movie> movie = movieRepository.findById(request.getMovieId());
        if (movie.isEmpty()) {
            logger.warn("Movie not found: {}", request.getMovieId());
            throw new ResourceNotFoundException("Movie not found with ID: " + request.getMovieId());
        }

        // Validate room
        Optional<Room> room = roomRepository.findById(request.getRoomId());
        if (room.isEmpty()) {
            logger.warn("Room not found: {}", request.getRoomId());
            throw new ResourceNotFoundException("Room not found with ID: " + request.getRoomId());
        }
        if (room.get().getCapacity() < CommonConst.TOTAL_SEATS) {
            logger.warn("Room capacity {} is less than required {} seats", room.get().getCapacity(), CommonConst.TOTAL_SEATS);
            throw new IllegalStateException("Room capacity must be at least " + CommonConst.TOTAL_SEATS + " seats");
        }

        // Validate theater
        Optional<com.movietheater.entity.Theater> theater = theaterRepository.findById(request.getTheaterId());
        if (theater.isEmpty()) {
            logger.warn("Theater not found: {}", request.getTheaterId());
            throw new ResourceNotFoundException("Theater not found with ID: " + request.getTheaterId());
        }

        // Validate price
        if (request.getPrice().compareTo(CommonConst.PRICE_MIN) < 0 || request.getPrice().compareTo(CommonConst.PRICE_MAX) > 0) {
            logger.warn("Price {} is out of allowed range [{} - {}]", request.getPrice(), CommonConst.PRICE_MIN, CommonConst.PRICE_MAX);
            throw new IllegalArgumentException("Price must be between " + CommonConst.PRICE_MIN + " and " + CommonConst.PRICE_MAX);
        }

        // Parse showtime
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        LocalDateTime showtime;
        try {
            showtime = LocalDateTime.parse(request.getShowtime(), formatter);
        } catch (DateTimeParseException e) {
            logger.warn("Invalid showtime format: {}", request.getShowtime());
            throw new IllegalArgumentException("Invalid showtime format: " + request.getShowtime());
        }

        // Validate scheduling conflict
        validateNoSchedulingConflict(request.getRoomId(), showtime, scheduleId);

        // Update schedule
        schedule.setMovieId(request.getMovieId());
        schedule.setRoomId(request.getRoomId());
        schedule.setTheaterId(request.getTheaterId());
        schedule.setShowtime(showtime);
        schedule.setPrice(request.getPrice());

        scheduleRepository.save(schedule);
        logger.info("Showtime updated successfully: {}", scheduleId);

        return convertToDTO(schedule, new HashMap<>(), new HashMap<>());
    }

    private void validateNoSchedulingConflict(String roomId, LocalDateTime showtime, String excludeScheduleId) {
        LocalDateTime startWindow = showtime.minusMinutes(CommonConst.SHOWTIME_DURATION_MINUTES);
        LocalDateTime endWindow = showtime.plusMinutes(CommonConst.SHOWTIME_DURATION_MINUTES);
        
        List<Schedule> conflictingSchedules = scheduleRepository.findAll().stream()
            .filter(s -> s.getRoomId().equals(roomId))
            .filter(s -> excludeScheduleId == null || !s.getScheduleId().equals(excludeScheduleId))
            .filter(s -> !s.getShowtime().isBefore(startWindow) && !s.getShowtime().isAfter(endWindow))
            .toList();

        if (!conflictingSchedules.isEmpty()) {
            logger.warn("Scheduling conflict detected for room {} at time {}", roomId, showtime);
            throw new IllegalStateException("Scheduling conflict: Room is already booked for this time slot");
        }
    }

    private void createScheduleSeats(String scheduleId, String shortScheduleId) {
        for (int row = 0; row < CommonConst.TOTAL_ROWS; row++) {
            String rowLabel = String.valueOf((char) ('A' + row));
            String seatType = row < 3 ? CommonConst.SEAT_TYPE_NORMAL : CommonConst.SEAT_TYPE_VIP;
            for (int col = 1; col <= CommonConst.SEATS_PER_ROW; col++) {
                String seatColumnPadded = String.format("%02d", col);
                String seatId = String.format("S%s-%s%s", shortScheduleId, rowLabel, seatColumnPadded);
                ScheduleSeat seat = ScheduleSeat.builder()
                    .scheduleSeatId(seatId)
                    .scheduleId(scheduleId)
                    .seatRow(rowLabel)
                    .seatColumn(col)
                    .seatType(seatType)
                    .seatStatus(CommonConst.SEAT_STATUS_AVAILABLE)
                    .build();
                scheduleSeatRepository.save(seat);
                logger.debug("Created seat {} for schedule {}, row {}, column {}, type: {}", 
                    seatId, scheduleId, rowLabel, col, seatType);
            }
        }
        List<ScheduleSeat> savedSeats = scheduleSeatRepository.findByScheduleId(scheduleId);
        long normalSeats = savedSeats.stream().filter(seat -> seat.getSeatType().equals(CommonConst.SEAT_TYPE_NORMAL)).count();
        long vipSeats = savedSeats.stream().filter(seat -> seat.getSeatType().equals(CommonConst.SEAT_TYPE_VIP)).count();
        logger.info("Created {} seats for schedule {}: {} NORMAL, {} VIP", 
            savedSeats.size(), scheduleId, normalSeats, vipSeats);
    }

    private ShowtimeResponse convertToDTO(Schedule schedule, Map<String, String> movieCache, Map<String, String> roomCache) {
        return ShowtimeResponse.builder()
            .scheduleId(schedule.getScheduleId())
            .movieId(schedule.getMovieId())
            .roomId(schedule.getRoomId())
            .theaterId(schedule.getTheaterId())
            .movieTitle(movieCache.computeIfAbsent(schedule.getMovieId(), id ->
                movieRepository.findById(id).map(movie -> movie.getTitle()).orElse("Unknown")))
            .showtime(schedule.getShowtime())
            .roomName(roomCache.computeIfAbsent(schedule.getRoomId(), id ->
                roomRepository.findById(id).map(room -> room.getRoomName()).orElse("Unknown")))
            .status(schedule.getAvailableSeats() > 0 ? "Available" : "Full")
            .price(schedule.getPrice())
            .totalSeats(schedule.getTotalSeats())
            .availableSeats(schedule.getAvailableSeats())
            .build();
    }
}