package com.movietheater.common.exception.handler;

import com.movietheater.common.annotation.RestApiErrorResponse;
import com.movietheater.common.annotation.RestApiErrorResponses;
import com.movietheater.common.exception.dto.ErrorResponseBody;
import com.movietheater.common.exception.AuthException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ArrayUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import com.movietheater.common.constant.MessageConst;

import java.lang.reflect.Method;

/**
 * Aspect for handling exceptions in REST API controllers.
 */
@Slf4j
@Aspect
@Component
public class RestApiErrorHandler {

    @Pointcut("execution(public * *(..)) && within(@org.springframework.web.bind.annotation.RestController *)")
    public void restApiMethods() {}

    @Around("restApiMethods()")
    public Object logApiAccess(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attrs != null ? attrs.getRequest() : null;
        String method = request != null ? request.getMethod() : "N/A";
        String path = request != null ? request.getRequestURI() : "N/A";
        String user = request != null && request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "anonymous";
        int status = 200;
        try {
            Object result = pjp.proceed();
            if (attrs != null && attrs.getResponse() != null) {
                status = attrs.getResponse().getStatus();
            }
            return result;
        } catch (Exception e) {
            if (attrs != null && attrs.getResponse() != null) {
                status = attrs.getResponse().getStatus();
            } else {
                status = 500;
            }
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - start;
            log.info(MessageConst.LOG_API_ACCESS, method, path, user, status, duration);
        }
    }

    @Around("execution(public * *(..)) && within(@org.springframework.web.bind.annotation.RestController *)")
    private Object handleException(ProceedingJoinPoint pjp) throws Throwable {
        try {
            return pjp.proceed();
        } catch (Exception e) {
            log.error("Exception occurred in method: {} with message: {}", pjp.getSignature().getName(), e.getMessage());
            MethodSignature signature = (MethodSignature) pjp.getSignature();
            Method method = signature.getMethod();
            RestApiErrorResponses annotationWrapper = method.getAnnotation(RestApiErrorResponses.class);
            RestApiErrorResponse[] annotations = method.getAnnotationsByType(RestApiErrorResponse.class);
            if (annotationWrapper != null) {
                annotations = ArrayUtils.addAll(annotations, annotationWrapper.responses());
            }

            for (RestApiErrorResponse annotation : annotations) {
                if (annotation.on().value().isAssignableFrom(e.getClass())) {
                    ErrorResponseBody errorResponse = ErrorResponseBody.builder()
                            .code(annotation.code())
                            .message(annotation.message())
                            .originMessage(e.getMessage())
                            .build();
                    return new ResponseEntity<>(errorResponse, annotation.status());
                }
            }
            ErrorResponseBody errorResponse = ErrorResponseBody.builder()
                    .code("E0001")
                    .message("An unexpected error occurred")
                    .originMessage(e.getMessage())
                    .build();
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponseBody> handleAuthExceptions(AuthException ex) {
        ErrorResponseBody errorResponse = ErrorResponseBody.builder()
            .message(ex.getMessage())
            .code("AUTH_ERROR")
            .originMessage(ex.getMessage())
            .build();
        return ResponseEntity.badRequest().body(errorResponse);
    }
}