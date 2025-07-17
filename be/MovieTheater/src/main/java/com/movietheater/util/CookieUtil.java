
package com.movietheater.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Utility class for handling HTTP cookies, especially for authentication and user session management.
 */
public class CookieUtil {
    /**
     * Add a cookie to the HTTP response.
     * @param response HttpServletResponse to add the cookie to
     * @param name Name of the cookie
     * @param value Value of the cookie
     * @param maxAge Maximum age of the cookie in seconds
     */
    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        try {
            String encodedValue = URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
            Cookie cookie = new Cookie(name, encodedValue);
            cookie.setPath("/");
            cookie.setHttpOnly(false); // FE đọc được
            cookie.setMaxAge(maxAge);
            cookie.setSecure(false); // True nếu deploy HTTPS
            response.addCookie(cookie);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    /**
     * Remove a cookie from the HTTP response by setting its max age to 0.
     * @param response HttpServletResponse to remove the cookie from
     * @param name Name of the cookie to remove
     */
    public static void removeCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
