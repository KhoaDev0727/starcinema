package com.movietheater.common.enumeration;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Enumerations for database-related descriptions.
 */
public class DatabaseDescriptionOption {

    /**
     * Enum for seat types in the movie theater.
     */
    @Getter
    @AllArgsConstructor
    public enum SEAT_TYPE {
        NORMAL(0, "Normal Seat", 13),
        VIP(1, "VIP Seat", 25);

        private final int id;
        private final String description;
        private final Integer defaultPrice;
    }
}