import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useOAuthRedirect = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    const fullName = params.get("fullName");
    const role = params.get("role");

    if (userId && fullName && role) {
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userRole", role);
    }
  }, [location]);
};