package com.movietheater.util;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility class for common operations.
 */
public class BookingUtils {
    private static final Logger logger = LoggerFactory.getLogger(BookingUtils.class);

    /**
     * Generates a unique booking ID.
     *
     * @return a unique booking ID
     */
    public static String generateBookingId() {
        String bookingId = UUID.randomUUID().toString();
        logger.debug("Generated booking ID: {}", bookingId);
        return bookingId;
    }
}