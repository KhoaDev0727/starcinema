package com.movietheater.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to define multiple error responses for REST API methods.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RestApiErrorResponses {
    RestApiErrorResponse[] responses() default {};
    String defaultMessage() default "An error occurred";
}