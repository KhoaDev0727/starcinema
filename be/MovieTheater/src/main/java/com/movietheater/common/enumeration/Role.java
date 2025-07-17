package com.movietheater.common.enumeration;

/**
 * Constants for user roles in the system.
 */
public class Role {

    private Role() {
        // Private constructor to prevent instantiation
    }

    public static final String ADMIN = "ROLE_ADMIN";
    public static final int ADMIN_ID = 1;
    public static final String EMPLOYEE = "ROLE_EMPLOYEE";
    public static final int EMPLOYEE_ID = 2;
    public static final String USER = "ROLE_USER";
    public static final int USER_ID = 3;
    public static final int DEFAULT_ROLE_ID = USER_ID;
}