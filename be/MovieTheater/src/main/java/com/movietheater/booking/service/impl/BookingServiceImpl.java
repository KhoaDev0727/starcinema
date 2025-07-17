package com.movietheater.booking.service.impl;

import com.movietheater.booking.dto.request.BookingRequest;
import com.movietheater.booking.dto.response.BookingResponse;
import com.movietheater.booking.dto.response.MovieResponse;
import com.movietheater.booking.service.BookingService;
import com.movietheater.common.constant.CommonConst;
import com.movietheater.entity.Booking;
import com.movietheater.entity.Schedule;
import com.movietheater.entity.ScheduleSeat;
import com.movietheater.repository.BookingRepository;
import com.movietheater.repository.MovieRepository;
import com.movietheater.repository.ScheduleRepository;
import com.movietheater.repository.ScheduleSeatRepository;
import com.movietheater.util.BookingUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of booking service operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {
    private final ScheduleRepository scheduleRepository;
    private final ScheduleSeatRepository scheduleSeatRepository;
    private final MovieRepository movieRepository;
    private final BookingRepository bookingRepository;

    @Override
    public List<MovieResponse> getAllMoviesWithPosters() {
        log.info("Fetching all movies with posters");
        return movieRepository.findAllWithPosters().stream()
            .map(MovieResponse::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public MovieResponse getMovieById(String movieId) {
        log.info("Fetching movie with movieId: {}", movieId);
        return getAllMoviesWithPosters().stream()
            .filter(m -> m.getMovieId().equals(movieId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Movie not found with ID: " + movieId));
    }

    @Override
    public List<Schedule> getSchedulesByMovie(String movieId) {
        log.info("Fetching schedules for movieId: {}", movieId);
        return movieId == null ? scheduleRepository.findAll() : scheduleRepository.findByMovieId(movieId);
    }

    @Override
    public Schedule getScheduleById(String scheduleId) {
        log.info("Fetching schedule with scheduleId: {}", scheduleId);
        return getSchedulesByMovie(null).stream()
            .filter(s -> s.getScheduleId().equals(scheduleId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Schedule not found with ID: " + scheduleId));
    }

    @Override
    public List<ScheduleSeat> getSeatsBySchedule(String scheduleId) {
        log.info("Fetching seats for scheduleId: {}", scheduleId);
        return scheduleSeatRepository.findByScheduleId(scheduleId);
    }

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest bookingRequest) {
        log.info("Creating booking for userId: {}, scheduleId: {}, seatId: {}",
            bookingRequest.getUserId(), bookingRequest.getScheduleId(), bookingRequest.getSeatIds().get(0));

        bookingRequest.validate();
        Schedule schedule = validateAndGetSchedule(bookingRequest.getScheduleId());
        ScheduleSeat seat = validateAndGetSeat(bookingRequest.getSeatIds().get(0));

        // Check seat availability
        if (!CommonConst.SEAT_STATUS_AVAILABLE.equals(seat.getSeatStatus())) {
            log.error("Seat is not available: {}", bookingRequest.getSeatIds().get(0));
            throw new IllegalStateException("Seat is already booked");
        }

        // Update seat status and schedule
        seat.setSeatStatus(CommonConst.SEAT_STATUS_BOOKED);
        scheduleSeatRepository.save(seat);
        schedule.setAvailableSeats(schedule.getAvailableSeats() - 1);
        scheduleRepository.save(schedule);

        // Calculate price based on seat type
        BigDecimal price = calculateSeatPrice(schedule, seat);

        // Create booking using builder
        Booking booking = Booking.builder()
            .bookingId(BookingUtils.generateBookingId())
            .userId(Long.parseLong(bookingRequest.getUserId()))
            .scheduleId(bookingRequest.getScheduleId())
            .seatId(bookingRequest.getSeatIds().get(0))
            .bookingDate(LocalDateTime.now())
            .status(CommonConst.BOOKING_STATUS_PENDING)
            .promotionId(bookingRequest.getPromotionId())
            .price(price)
            .build();

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created successfully with bookingId: {}", savedBooking.getBookingId());
        return convertToResponse(savedBooking);
    }

    @Override
    @Transactional
    public List<BookingResponse> createBookings(BookingRequest bookingRequest) {
        log.info("Creating bookings for userId: {}, scheduleId: {}, seatIds: {}",
            bookingRequest.getUserId(), bookingRequest.getScheduleId(), bookingRequest.getSeatIds());

        bookingRequest.validate();
        Schedule schedule = validateAndGetSchedule(bookingRequest.getScheduleId());
        List<ScheduleSeat> seats = validateAndGetSeats(bookingRequest.getSeatIds());

        // Validate seat availability
        seats.forEach(seat -> {
            if (!CommonConst.SEAT_STATUS_AVAILABLE.equals(seat.getSeatStatus())) {
                log.error("Seat is not available: {}", seat.getScheduleSeatId());
                throw new IllegalStateException("One or more seats are already booked");
            }
        });

        // Check for isolated seats and warn (not block)
        String warning = validateSeatConsecutiveness(seats);
        if (warning != null) {
            log.warn("Seat selection warning: {}", warning);
        }

        // Update seats and schedule
        seats.forEach(seat -> seat.setSeatStatus(CommonConst.SEAT_STATUS_BOOKED));
        scheduleSeatRepository.saveAll(seats);
        schedule.setAvailableSeats(schedule.getAvailableSeats() - seats.size());
        scheduleRepository.save(schedule);

        // Create bookings with calculated prices
        List<Booking> bookings = bookingRequest.getSeatIds().stream()
            .map(seatId -> {
                ScheduleSeat seat = seats.stream()
                    .filter(s -> s.getScheduleSeatId().equals(seatId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("Seat not found: " + seatId));
                return Booking.builder()
                    .bookingId(BookingUtils.generateBookingId())
                    .userId(Long.parseLong(bookingRequest.getUserId()))
                    .scheduleId(bookingRequest.getScheduleId())
                    .seatId(seatId)
                    .bookingDate(LocalDateTime.now())
                    .status(CommonConst.BOOKING_STATUS_PENDING)
                    .promotionId(bookingRequest.getPromotionId())
                    .price(calculateSeatPrice(schedule, seat))
                    .build();
            })
            .collect(Collectors.toList());

        List<Booking> savedBookings = bookingRepository.saveAll(bookings);
        log.info("Created {} bookings successfully", savedBookings.size());
        return convertToResponses(savedBookings);
    }

    @Override
    public List<BookingResponse> getBookingsByUserId(String userId) {
        log.info("Fetching bookings for userId: {}", userId);
        try {
            Long parsedUserId = Long.parseLong(userId);
            return bookingRepository.findByUserId(parsedUserId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId, e);
            throw new IllegalArgumentException("Invalid user ID format");
        }
    }

    @Override
    public BookingResponse getBookingById(String bookingId, String userId) {
        log.info("Fetching booking with bookingId: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUserId().toString().equals(userId)) {
            log.warn("Unauthorized access to bookingId: {} by userId: {}", bookingId, userId);
            throw new IllegalArgumentException("Unauthorized access to booking");
        }
        return convertToResponse(booking);
    }

    @Override
    @Transactional
    public void cancelBooking(String bookingId, String userId) {
        log.info("Cancelling booking with bookingId: {} for userId: {}", bookingId, userId);
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUserId().toString().equals(userId)) {
            log.warn("Unauthorized cancel attempt for bookingId: {} by userId: {}", bookingId, userId);
            throw new IllegalArgumentException("Unauthorized access to booking");
        }
        if (!CommonConst.BOOKING_STATUS_PENDING.equals(booking.getStatus())) {
            log.warn("Booking is not pending, cannot cancel: {}", booking.getBookingId());
            throw new IllegalStateException("Only pending bookings can be cancelled");
        }
        Schedule schedule = scheduleRepository.findById(booking.getScheduleId())
            .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        if (schedule.getShowtime().isBefore(LocalDateTime.now().plusHours(6))) {
            log.warn("Showtime is less than 6 hours away, cannot cancel booking: {}", booking.getBookingId());
            throw new IllegalStateException("Cannot cancel booking less than 6 hours before showtime");
        }
        if (CommonConst.BOOKING_STATUS_CANCELLED.equals(booking.getStatus())) {
            log.warn("Booking already cancelled: {}", bookingId);
            return;
        }
        // Update booking status
        booking.setStatus(CommonConst.BOOKING_STATUS_CANCELLED);
        bookingRepository.save(booking);
        // Update seat status
        ScheduleSeat seat = scheduleSeatRepository.findById(booking.getSeatId())
            .orElseThrow(() -> new IllegalArgumentException("Seat not found"));
        seat.setSeatStatus(CommonConst.SEAT_STATUS_AVAILABLE);
        scheduleSeatRepository.save(seat);
        // Update schedule available seats
        Schedule scheduleToUpdate = scheduleRepository.findById(booking.getScheduleId())
            .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        scheduleToUpdate.setAvailableSeats(scheduleToUpdate.getAvailableSeats() + 1);
        scheduleRepository.save(scheduleToUpdate);
        log.info("Booking cancelled successfully: {}", bookingId);
    }

    // Helper method to validate and fetch schedule
    private Schedule validateAndGetSchedule(String scheduleId) {
        return scheduleRepository.findById(scheduleId)
            .orElseThrow(() -> {
                log.error("Schedule not found for scheduleId: {}", scheduleId);
                return new IllegalArgumentException("Schedule not found");
            });
    }

    // Helper method to validate and fetch single seat
    private ScheduleSeat validateAndGetSeat(String seatId) {
        return scheduleSeatRepository.findById(seatId)
            .orElseThrow(() -> {
                log.error("Seat not found for seatId: {}", seatId);
                return new IllegalArgumentException("Seat not found");
            });
    }

    // Helper method to validate and fetch seats
    private List<ScheduleSeat> validateAndGetSeats(List<String> seatIds) {
        List<ScheduleSeat> seats = scheduleSeatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size()) {
            log.error("One or more seats not found: {}", seatIds);
            throw new IllegalArgumentException("One or more seats not found");
        }
        return seats;
    }

    // Helper method to validate seat consecutiveness
    private String validateSeatConsecutiveness(List<ScheduleSeat> seats) {
        var seatsByRow = seats.stream()
            .collect(Collectors.groupingBy(ScheduleSeat::getSeatRow));
        for (var entry : seatsByRow.entrySet()) {
            List<ScheduleSeat> rowSeats = entry.getValue();
            if (rowSeats.size() == 2) {
                rowSeats.sort((a, b) -> a.getSeatColumn() - b.getSeatColumn());
                int minCol = rowSeats.get(0).getSeatColumn();
                int maxCol = rowSeats.get(rowSeats.size() - 1).getSeatColumn();
                if (maxCol - minCol > 1) { // Gap exists (e.g., 1, 3)
                    return "Selection of 2 seats leaves a gap in the middle";
                }
            }
            if (rowSeats.size() > 1) {
                rowSeats.sort((a, b) -> a.getSeatColumn() - b.getSeatColumn());
                int minCol = rowSeats.get(0).getSeatColumn();
                int maxCol = rowSeats.get(rowSeats.size() - 1).getSeatColumn();

                // Check for gaps
                for (int col = minCol; col <= maxCol; col++) {
                    final int currentCol = col;
                    if (rowSeats.stream().noneMatch(s -> s.getSeatColumn() == currentCol)) {
                        return "Selected seats have gaps. Please confirm your selection.";
                    }
                }

                // Check for isolated seats
                for (int i = 0; i < rowSeats.size(); i++) {
                    int currentCol = rowSeats.get(i).getSeatColumn();
                    int prevCol = i > 0 ? rowSeats.get(i - 1).getSeatColumn() : -1;
                    int nextCol = i < rowSeats.size() - 1 ? rowSeats.get(i + 1).getSeatColumn() : -1;

                    if (prevCol != -1 && nextCol != -1 && currentCol != prevCol + 1 && currentCol != nextCol - 1) {
                        return "Selection leaves an isolated seat. Please confirm your selection.";
                    }
                }
            }
        }
        return null;
    }

    // Helper method to calculate price based on seat type
    private BigDecimal calculateSeatPrice(Schedule schedule, ScheduleSeat seat) {
        BigDecimal basePrice = schedule.getPrice();
        if (seat.getSeatType().equals("VIP")) {
            return basePrice.add(CommonConst.VIP_SURCHARGE);
        }
        return basePrice;
    }

    private BookingResponse convertToResponse(Booking booking) {
        return BookingResponse.builder()
            .bookingId(booking.getBookingId())
            .userId(booking.getUserId().toString())
            .scheduleId(booking.getScheduleId())
            .seatId(booking.getSeatId())
            .bookingDate(booking.getBookingDate())
            .status(booking.getStatus())
            .promotionId(booking.getPromotionId())
            .price(booking.getPrice())
            .build();
    }

    private List<BookingResponse> convertToResponses(List<Booking> bookings) {
        return bookings.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
}