package com.movietheater.common.exception.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Data Transfer Object for error responses.
 */
@Data
@Builder
public class ErrorResponseBody {
    private String message;
    private String code;
    private String originMessage;
}