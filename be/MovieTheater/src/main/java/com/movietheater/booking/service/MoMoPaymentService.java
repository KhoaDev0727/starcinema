package com.movietheater.booking.service;

import com.movietheater.booking.dto.request.BookingRequest;
import com.movietheater.booking.dto.response.BookingResponse;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Interface for MoMo payment service operations.
 */
public interface MoMoPaymentService {
	
	/**
     * Initiates a MoMo payment transaction.
     *
     * @param bookingRequest the booking request data
     * @param totalAmount the total payment amount
     * @return Map containing payment details
     */
    Map<String, Object> initiateMoMoPayment(BookingRequest bookingRequest, BigDecimal totalAmount);
    
    /**
     * Handles MoMo payment callback.
     *
     * @param callbackParams the callback parameters
     * @return the BookingResponse object
     */
    BookingResponse handleMoMoCallback(Map<String, String> callbackParams);
}