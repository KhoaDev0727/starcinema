package com.movietheater.common.constant;

import java.math.BigDecimal;

/**
 * Common constants for the movie theater application.
 */
public class CommonConst {

    // Seat status constants
    public static final String SEAT_STATUS_AVAILABLE = "AVAILABLE";
    public static final String SEAT_STATUS_BOOKED = "BOOKED";

    // Booking status constants
    public static final String BOOKING_STATUS_PENDING = "PENDING";
    public static final String BOOKING_STATUS_CANCELLED = "CANCELLED";
    
    public static final String BOOKING_STATUS_PAID = "PAID";
    public static final String BOOKING_STATUS_FAILED = "FAILED";
    public static final String BOOKING_STATUS_EXPIRED = "EXPIRED";

    // Pricing constants
    public static final BigDecimal VIP_SURCHARGE = new BigDecimal("20000");
    public static final BigDecimal PRICE_MIN = new BigDecimal("1000.00");
    public static final BigDecimal PRICE_MAX = new BigDecimal("10000000.00");

    // Showtime and seat management constants
    public static final int SHOWTIME_DURATION_MINUTES = 180;
    public static final int SEATS_PER_ROW = 13;
    public static final int TOTAL_ROWS = 8;
    public static final int TOTAL_SEATS = SEATS_PER_ROW * TOTAL_ROWS;
    public static final int MAX_SHOWTIMES = 100;
    public static final String SEAT_TYPE_NORMAL = "NORMAL";
    public static final String SEAT_TYPE_VIP = "VIP";

    // Media type constants
    public static final String MEDIA_TYPE_IMAGE = "image";

    // Default values for configurations
    public static final String DEFAULT_LANGUAGE = "en";
    public static final String DEFAULT_CURRENCY = "USD";
    public static final String DEFAULT_TIMEZONE = "UTC";
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    public static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
    public static final long DEFAULT_PERFORMANCE_THRESHOLD = 5; // 5 seconds

    // Pagination constants
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MIN_PAGE_SIZE = 1;
    public static final int MAX_PAGE_SIZE = 100;
    public static final int DEFAULT_PAGE_NUMBER = 0;

    public static final String HEADER_USER_ID = "userId";

    private CommonConst() {
        // Private constructor to prevent instantiation
    }
}