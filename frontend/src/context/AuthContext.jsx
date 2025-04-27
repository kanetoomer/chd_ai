import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { apiService } from "../services/apiService";

// Create context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);

          // Verify token validity with the server
          // This is optional but recommended for security
          try {
            const response = await apiService.get("/auth/me");
            setCurrentUser(response.user);
            setIsAuthenticated(true);
          } catch (error) {
            // If the token is invalid, log out
            handleLogout();
          }
        } catch (error) {
          // If there's an error parsing the user, log out
          handleLogout();
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);

    try {
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });

      // Store token in localStorage
      localStorage.setItem("token", response.token);

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(response.user));

      // Set current user
      setCurrentUser(response.user);
      setIsAuthenticated(true);

      toast.success("Login successful");

      // Return true to indicate success
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setIsLoading(true);

    try {
      const response = await apiService.post("/auth/register", userData);

      // Store token in localStorage
      localStorage.setItem("token", response.token);

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(response.user));

      // Set current user
      setCurrentUser(response.user);
      setIsAuthenticated(true);

      toast.success("Registration successful");

      // Return true to indicate success
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to register");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      // Call logout API (optional, depends on your backend)
      await apiService.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Clear current user
      setCurrentUser(null);

      // Redirect to login page
      navigate("/login");

      toast.success("Logged out successfully");
    }
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
