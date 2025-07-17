package com.movietheater.common.annotation;

import org.springframework.http.HttpStatus;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to define error responses for REST API methods.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RestApiErrorResponse {
    HttpStatus status() default HttpStatus.INTERNAL_SERVER_ERROR;
    String message() default "An error occurred";
    String code() default "E0001";

    Exception on();

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.ANNOTATION_TYPE)
    @interface Exception {
        Class<? extends java.lang.Exception> value();
    }
}