package com.movietheater.common.exception.dto;

import java.util.Map;

public class FieldValidationException extends RuntimeException {
    private final Map<String, Object> errorResponse;

    public FieldValidationException(Map<String, Object> errorResponse) {
        super((String) errorResponse.get("message"));
        this.errorResponse = errorResponse;
    }

    public Map<String, Object> getErrorResponse() {
        return errorResponse;
    }
} 