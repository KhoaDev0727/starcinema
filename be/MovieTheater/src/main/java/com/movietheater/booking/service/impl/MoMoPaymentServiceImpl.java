package com.movietheater.booking.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movietheater.booking.dto.request.BookingRequest;
import com.movietheater.booking.dto.response.BookingResponse;
import com.movietheater.booking.service.MoMoPaymentService;
import com.movietheater.common.constant.CommonConst;
import com.movietheater.entity.Booking;
import com.movietheater.entity.Schedule;
import com.movietheater.entity.ScheduleSeat;
import com.movietheater.repository.BookingRepository;
import com.movietheater.repository.ScheduleRepository;
import com.movietheater.repository.ScheduleSeatRepository;
import com.movietheater.util.BookingUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoMoPaymentServiceImpl implements MoMoPaymentService {
    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleSeatRepository scheduleSeatRepository;
    private final ObjectMapper objectMapper;

    @Value("${momo.endpoint}")
    private String momoEndpoint;

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    private static final String REQUEST_TYPE = "captureWallet";
    private static final int PAYMENT_TIMEOUT_SECONDS = 30;
    private final ConcurrentHashMap<String, ScheduledFuture<?>> timeoutTasks = new ConcurrentHashMap<>();

    @Override
    @Transactional
    public Map<String, Object> initiateMoMoPayment(BookingRequest bookingRequest, BigDecimal totalAmount) {
        log.info("Initiating MoMo payment for userId: {}, scheduleId: {}, seatIds: {}, at: {}", 
                bookingRequest.getUserId(), bookingRequest.getScheduleId(), bookingRequest.getSeatIds(), LocalDateTime.now());

        try {
            // Validate request
            bookingRequest.validate();
            Schedule schedule = validateAndGetSchedule(bookingRequest.getScheduleId());
            List<ScheduleSeat> seats = validateAndGetSeats(bookingRequest.getSeatIds());

            // Check for duplicate bookings
            List<Booking> existingBookings = bookingRepository.findByUserId(Long.parseLong(bookingRequest.getUserId())).stream()
                    .filter(b -> b.getScheduleId().equals(bookingRequest.getScheduleId()) &&
                            bookingRequest.getSeatIds().contains(b.getSeatId()) &&
                            (CommonConst.BOOKING_STATUS_PAID.equals(b.getStatus()) ||
                             CommonConst.BOOKING_STATUS_PENDING.equals(b.getStatus())))
                    .collect(Collectors.toList());
            if (!existingBookings.isEmpty()) {
                log.warn("Duplicate bookings found for userId: {}, scheduleId: {}, seatIds: {}", 
                        bookingRequest.getUserId(), bookingRequest.getScheduleId(), bookingRequest.getSeatIds());
                throw new IllegalStateException("Duplicate bookings found for the selected seats");
            }

            // Create bookings with PAID status
            String orderId = "BOOKING-" + UUID.randomUUID().toString();
            List<Booking> bookings = createBookings(bookingRequest, schedule, seats, orderId);
            String requestId = "REQ-" + UUID.randomUUID().toString();
            String orderInfo = "Movie ticket payment";

            // Schedule timeout for 30 seconds
            schedulePaymentTimeout(bookings, orderId);

            // Convert totalAmount to long (MoMo requires integer amount in VND)
            long amount = totalAmount.longValue();

            // Create signature
            String rawHash = String.format("accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                    accessKey, amount, "", ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, REQUEST_TYPE);
            String signature = hmacSHA256(rawHash, secretKey);
            log.info("Generated MoMo signature: {}, rawHash: {}", signature, rawHash);

            // Prepare MoMo request
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("partnerCode", partnerCode);
            requestData.put("partnerName", "MovieTheater");
            requestData.put("requestId", requestId);
            requestData.put("amount", amount);
            requestData.put("orderId", orderId);
            requestData.put("orderInfo", orderInfo);
            requestData.put("redirectUrl", redirectUrl);
            requestData.put("ipnUrl", ipnUrl);
            requestData.put("lang", "vi");
            requestData.put("extraData", "");
            requestData.put("requestType", REQUEST_TYPE);
            requestData.put("signature", signature);

            // Send request to MoMo
            log.info("Sending MoMo request: {}", requestData);
            HttpURLConnection conn = (HttpURLConnection) new URL(momoEndpoint).openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(objectMapper.writeValueAsBytes(requestData));
                os.flush();
            }

            if (conn.getResponseCode() == 200) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                    Map<String, Object> response = objectMapper.readValue(reader, Map.class);
                    log.error("MoMo API response: {}", response);
                    response.put("bookingIds", bookings.stream().map(Booking::getBookingId).collect(Collectors.toList()));
                    return response;
                }
            } else {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getErrorStream()))) {
                    String errorResponse = reader.lines().collect(Collectors.joining());
                    log.error("MoMo API error: {}, responseCode: {}", errorResponse, conn.getResponseCode());
                    throw new RuntimeException("MoMo payment initiation failed: " + errorResponse);
                }
            }
        } catch (Exception e) {
            log.error("Error initiating MoMo payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initiate MoMo payment", e);
        }
    }

    @Override
    @Transactional
    public BookingResponse handleMoMoCallback(Map<String, String> callbackParams) {
        log.info("Handling MoMo callback with params: {}, at: {}", callbackParams, LocalDateTime.now());

        try {
            // Verify signature
            String rawSignature = String.format("accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
                    accessKey, callbackParams.get("amount"), callbackParams.get("extraData"),
                    callbackParams.get("message"), callbackParams.get("orderId"), callbackParams.get("orderInfo"),
                    callbackParams.get("orderType"), partnerCode, callbackParams.get("payType"),
                    callbackParams.get("requestId"), callbackParams.get("responseTime"), callbackParams.get("resultCode"),
                    callbackParams.get("transId"));
            String signature = hmacSHA256(rawSignature, secretKey);
            log.error("Calculated signature: {}, Callback signature: {}, Raw signature: {}", 
                    signature, callbackParams.get("signature"), rawSignature);

            if (!signature.equals(callbackParams.get("signature"))) {
                log.error("Invalid MoMo callback signature for orderId: {}", callbackParams.get("orderId"));
                throw new SecurityException("Invalid callback signature");
            }

            String resultCode = callbackParams.get("resultCode");
            String orderId = callbackParams.get("orderId");
            List<Booking> bookings = bookingRepository.findByOrderId(orderId);

            if (bookings.isEmpty()) {
                log.error("No bookings found for orderId: {}", orderId);
                throw new IllegalStateException("No bookings found for order");
            }

            log.info("Found {} bookings for orderId: {}", bookings.size(), orderId);
            if ("0".equals(resultCode)) {
                // Payment successful, cancel scheduled timeout and keep PAID status
                ScheduledFuture<?> future = timeoutTasks.remove(orderId);
                if (future != null) {
                    future.cancel(false);
                    log.error("Cancelled timeout for orderId: {} due to successful payment", orderId);
                }
                for (Booking booking : bookings) {
                    booking.setStatus(CommonConst.BOOKING_STATUS_PAID);
                    booking.setPaymentMethod("MOMO");
                    booking.setPaymentDate(LocalDateTime.now());
                    log.error("Confirmed booking {} as PAID", booking.getBookingId());
                }
                bookingRepository.saveAll(bookings);
                log.error("MoMo payment successful for orderId: {}, confirmed PAID status for bookings: {}", 
                        orderId, bookings.stream().map(Booking::getBookingId).collect(Collectors.toList()));
                return convertToResponse(bookings.get(0));
            } else {
                // Payment failed or cancelled, let the existing timeout handle EXPIRED status
                log.warn("MoMo payment failed for orderId: {}, resultCode: {}, relying on existing timeout", 
                        orderId, resultCode);
                throw new RuntimeException("Payment failed with resultCode: " + resultCode);
            }
        } catch (Exception e) {
            log.error("Error handling MoMo callback for orderId: {}: {}", 
                    callbackParams.get("orderId"), e.getMessage(), e);
            throw new RuntimeException("Failed to handle MoMo callback", e);
        }
    }

    private List<Booking> createBookings(BookingRequest bookingRequest, Schedule schedule, List<ScheduleSeat> seats, String orderId) {
        log.info("Creating bookings with PAID status for userId: {}, scheduleId: {}, seatIds: {}, orderId: {}, at: {}", 
                bookingRequest.getUserId(), bookingRequest.getScheduleId(), bookingRequest.getSeatIds(), orderId, LocalDateTime.now());

        seats.forEach(seat -> {
            if (!CommonConst.SEAT_STATUS_AVAILABLE.equals(seat.getSeatStatus())) {
                log.error("Seat is not available: {}", seat.getScheduleSeatId());
                throw new IllegalStateException("One or more seats are already booked");
            }
            seat.setSeatStatus(CommonConst.SEAT_STATUS_BOOKED);
        });
        scheduleSeatRepository.saveAll(seats);
        schedule.setAvailableSeats(schedule.getAvailableSeats() - seats.size());
        scheduleRepository.save(schedule);
        log.error("Updated schedule {} with availableSeats: {}", schedule.getScheduleId(), schedule.getAvailableSeats());

        List<Booking> bookings = bookingRequest.getSeatIds().stream()
                .map(seatId -> {
                    ScheduleSeat seat = seats.stream()
                            .filter(s -> s.getScheduleSeatId().equals(seatId))
                            .findFirst()
                            .orElseThrow(() -> {
                                log.error("Seat not found for seatId: {}", seatId);
                                return new IllegalStateException("Seat not found: " + seatId);
                            });
                    Booking booking = Booking.builder()
                            .bookingId(BookingUtils.generateBookingId())
                            .userId(Long.parseLong(bookingRequest.getUserId()))
                            .scheduleId(bookingRequest.getScheduleId())
                            .seatId(seatId)
                            .bookingDate(LocalDateTime.now())
                            .status(CommonConst.BOOKING_STATUS_PAID)
                            .promotionId(bookingRequest.getPromotionId())
                            .price(calculateSeatPrice(schedule, seat))
                            .orderId(orderId)
                            .paymentMethod("MOMO")
                            .paymentDate(LocalDateTime.now())
                            .build();
                    log.error("Created booking {} with PAID status for seatId: {}", 
                            booking.getBookingId(), seatId);
                    return booking;
                })
                .collect(Collectors.toList());

        List<Booking> savedBookings = bookingRepository.saveAll(bookings);
        log.error("Saved {} bookings with orderId: {}", savedBookings.size(), orderId);
        return savedBookings;
    }

    private void revertBookings(List<Booking> bookings, String orderId) {
        log.info("Reverting bookings for orderId: {}, at: {}", orderId, LocalDateTime.now());
        bookings.forEach(booking -> {
            booking.setStatus(CommonConst.BOOKING_STATUS_EXPIRED);
            ScheduleSeat seat = scheduleSeatRepository.findById(booking.getSeatId())
                    .orElseThrow(() -> {
                        log.error("Seat not found for seatId: {}", booking.getSeatId());
                        return new IllegalStateException("Seat not found: " + booking.getSeatId());
                    });
            seat.setSeatStatus(CommonConst.SEAT_STATUS_AVAILABLE);
            scheduleSeatRepository.save(seat);
            Schedule schedule = scheduleRepository.findById(booking.getScheduleId())
                    .orElseThrow(() -> {
                        log.error("Schedule not found for scheduleId: {}", booking.getScheduleId());
                        return new IllegalStateException("Schedule not found: " + booking.getScheduleId());
                    });
            schedule.setAvailableSeats(schedule.getAvailableSeats() + 1);
            scheduleRepository.save(schedule);
            log.error("Set booking {} to EXPIRED and released seat {}", 
                    booking.getBookingId(), booking.getSeatId());
        });
        bookingRepository.saveAll(bookings);
        log.error("Reverted {} bookings to EXPIRED for orderId: {}", bookings.size(), orderId);
    }

    private void schedulePaymentTimeout(List<Booking> bookings, String orderId) {
        log.error("Scheduling payment timeout for bookings with orderId: {}, at: {}", orderId, LocalDateTime.now());
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        ScheduledFuture<?> future = scheduler.schedule(() -> {
            try {
                log.error("Processing payment timeout for orderId: {}, started at: {}", orderId, LocalDateTime.now());
                List<Booking> currentBookings = bookingRepository.findByOrderId(orderId);
                if (currentBookings.isEmpty()) {
                    log.warn("No bookings found for orderId: {} during timeout processing", orderId);
                    return;
                }
                revertBookings(currentBookings, orderId);
                timeoutTasks.remove(orderId);
                log.error("Payment timeout completed for orderId: {}, updated bookings: {}, at: {}", 
                        orderId, currentBookings.stream().map(Booking::getBookingId).collect(Collectors.toList()), LocalDateTime.now());
            } catch (Exception e) {
                log.error("Error processing payment timeout for orderId: {}: {}", orderId, e.getMessage(), e);
            } finally {
                scheduler.shutdown();
            }
        }, PAYMENT_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        timeoutTasks.put(orderId, future);
    }

    private String hmacSHA256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("Error creating HMAC SHA256 signature: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create HMAC signature", e);
        }
    }

    private Schedule validateAndGetSchedule(String scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> {
                    log.error("Schedule not found for scheduleId: {}", scheduleId);
                    return new IllegalArgumentException("Schedule not found");
                });
    }

    private List<ScheduleSeat> validateAndGetSeats(List<String> seatIds) {
        List<ScheduleSeat> seats = scheduleSeatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size()) {
            log.error("One or more seats not found: {}", seatIds);
            throw new IllegalArgumentException("One or more seats not found");
        }
        return seats;
    }

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
}