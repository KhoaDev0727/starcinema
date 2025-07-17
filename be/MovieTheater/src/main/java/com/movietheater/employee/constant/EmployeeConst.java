package com.movietheater.employee.constant;

/**
 * Constants for employee management operations.
 */
public class EmployeeConst {

    // Employee status constants
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_INACTIVE = "INACTIVE";

    // Employee role constants
    public static final String ROLE_EMPLOYEE = "EMPLOYEE";

    // Employee ID prefix
    public static final String EMPLOYEE_ID_PREFIX = "E";

    // Validation messages
    public static final String MSG_EMPLOYEE_NOT_FOUND = "Employee not found";
    public static final String MSG_USER_NOT_FOUND = "User information not found for employee";
    public static final String MSG_PASSWORD_MISMATCH = "Password and confirmation do not match";
    public static final String MSG_PASSWORD_TOO_SHORT = "Password must be at least 8 characters long";
    public static final String MSG_EMAIL_EXISTS = "Email already exists in the system";
    public static final String MSG_PHONE_EXISTS = "Phone number already exists in the system";
    public static final String MSG_IDENTITY_CARD_EXISTS = "Identity card already exists in the system";

    // Success messages
    public static final String MSG_EMPLOYEE_ADDED = "Employee added successfully";
    public static final String MSG_EMPLOYEE_UPDATED = "Employee updated successfully";
    public static final String MSG_EMPLOYEE_DELETED = "Employee deleted successfully";
    public static final String MSG_EMPLOYEE_RESTORED = "Employee restored successfully";

    // Error codes
    public static final String ERROR_EMPLOYEE_NOT_FOUND = "E1001";
    public static final String ERROR_EMPLOYEE_ALREADY_EXISTS = "E1002";
    public static final String ERROR_FAILED_TO_ADD_EMPLOYEE = "E1003";
    public static final String ERROR_FAILED_TO_UPDATE_EMPLOYEE = "E1004";
    public static final String ERROR_FAILED_TO_DELETE_EMPLOYEE = "E1005";
    public static final String ERROR_FAILED_TO_RESTORE_EMPLOYEE = "E1006";
} 