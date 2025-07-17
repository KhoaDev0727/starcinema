/**
 * Utility functions for authentication and cookie management
 */

/**
 * Get a cookie value by name
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
};

/**
 * Set a cookie with optional expiration
 * @param name - The name of the cookie
 * @param value - The value to store
 * @param days - Number of days until expiration (optional)
 */
export const setCookie = (name: string, value: string, days?: number): void => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
};

/**
 * Delete a cookie by setting its expiration to the past
 * @param name - The name of the cookie to delete
 */
export const deleteCookie = (name: string): void => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

/**
 * Check if user is authenticated by verifying token cookie exists
 * @returns True if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getCookie('token') !== null;
};

/**
 * Get user role from cookie
 * @returns The user role or null if not found
 */
export const getUserRole = (): string | null => {
  return getCookie('role');
};

/**
 * Check if user has admin role
 * @returns True if user is admin
 */
export const isAdmin = (): boolean => {
  return getUserRole() === 'ADMIN';
}; 