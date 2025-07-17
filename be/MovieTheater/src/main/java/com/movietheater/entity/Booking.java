package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "BOOKINGS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @Column(name = "BOOKING_ID")
    private String bookingId;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "SCHEDULE_ID", nullable = false)
    private String scheduleId;

    @Column(name = "SEAT_ID", nullable = false)
    private String seatId;

    @Column(name = "BOOKING_DATE", nullable = false)
    private LocalDateTime bookingDate;

    @Column(name = "STATUS", nullable = false)
    private String status;

    @Column(name = "PROMOTION_ID")
    private String promotionId;

    @Column(name = "PRICE", nullable = false)
    private BigDecimal price;
    
    @Column(name = "ORDER_ID")
    private String orderId;

    @Column(name = "PAYMENT_METHOD")
    private String paymentMethod;

    @Column(name = "PAYMENT_DATE")
    private LocalDateTime paymentDate;
}