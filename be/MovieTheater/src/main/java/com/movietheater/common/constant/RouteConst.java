package com.movietheater.common.constant;

/**
 * Constants for API routes used in the movie theater application.
 */
public class RouteConst {

    public static final String API_VERSION = "/v1";
    public static final String API_BASE = "/api" + API_VERSION;
    public static final String API_PARAM_ID = "id";
    public static final String API_PARAM_ID_PATH = "/{" + API_PARAM_ID + "}";
    public static final String API_PARAM_MOVIE_ID = "movieId";
    public static final String API_PARAM_MOVIE_ID_PATH = "/{" + API_PARAM_MOVIE_ID + "}";
    public static final String API_PARAM_SCHEDULE_ID = "scheduleId";
    public static final String API_PARAM_SCHEDULE_ID_PATH = "/{" + API_PARAM_SCHEDULE_ID + "}";

    // Authentication routes
    public static final String AUTH_BASE = "/api";
    public static final String LOGIN = "/login";
    public static final String LOGOUT = LOGIN + "/logout";
    public static final String REGISTER = "/register";
    public static final String REGISTER_VERIFY = REGISTER + "/verify-code";
    public static final String REGISTER_RESEND = REGISTER + "/resend-code";
    public static final String PASSWORD = "/password";
    public static final String PASSWORD_FORGOT = PASSWORD + "/forgot";
    public static final String PASSWORD_VERIFY = PASSWORD + "/verify";
    public static final String PASSWORD_RESET = PASSWORD + "/reset";
    public static final String OAUTH2_SUCCESS = "/oauth2/success";

    // Admin routes
    public static final String ADMIN_BASE = "/api/admin";
    public static final String MOVIE = "/movie";
    public static final String MOVIE_SEARCH = MOVIE + "/search";
    public static final String SHOWTIME = "/showtime";
    public static final String SHOWTIME_DETAIL = SHOWTIME + API_PARAM_SCHEDULE_ID_PATH;
    public static final String ROOM = "/room";
    public static final String THEATER = "/theater";
    public static final String EMPLOYEES = "/employees";
    public static final String PROMOTION = "/promotions";
    public static final String SCORES = "/scores";
    public static final String TICKETS = "/tickets";

    // Booking routes
    public static final String BOOK_BASE = "/api/book" + API_VERSION;
    public static final String BOOKINGS = "/bookings";
    public static final String CONFIRM = "/confirm";
    public static final String SCHEDULE = "/schedule";
    public static final String SCHEDULE_ID = SCHEDULE + "/id" + API_PARAM_SCHEDULE_ID_PATH;
    public static final String SEAT = "/seat";

    // Employee routes
    public static final String EMPLOYEE_BASE = "/api/employee";

    // Theater and schedule routes
    public static final String THEATERS = "/api/theaters";
    public static final String LOCATIONS = "/api/locations";
    public static final String THEATERS_LOCATION = THEATERS + "/location";
    public static final String SCHEDULES_THEATER = "/api/schedules/theater";

    // Static resources
    public static final String IMAGES = "/images";
}