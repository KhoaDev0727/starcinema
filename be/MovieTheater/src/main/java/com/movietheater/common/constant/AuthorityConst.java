package com.movietheater.common.constant;

/**
 * Constants for security and role-based access control.
 */
public class AuthorityConst {
    public static final String AUTH_ROLE_ADMIN = "hasRole('ROLE_ADMIN')";
    public static final String AUTH_ROLE_EMPLOYEE = "hasRole('ROLE_EMPLOYEE')";
    public static final String AUTH_ROLE_USER = "hasRole('ROLE_USER')";
    public static final String AUTH_ANONYMOUS = "isAnonymous()";
    public static final String AUTH_ALL = "permitAll";
}