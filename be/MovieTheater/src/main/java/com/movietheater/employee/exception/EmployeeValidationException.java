package com.movietheater.employee.exception;

/**
 * Exception thrown when employee validation fails.
 */
public class EmployeeValidationException extends RuntimeException {
    
    public EmployeeValidationException(String message) {
        super(message);
    }
    
    public EmployeeValidationException(String message, Throwable cause) {
        super(message, cause);
    }
} 