import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// --- API CLIENT CONFIGURATION ---
/**
 * We define the API client directly here to ensure the file is self-contained 
 * and avoids resolution errors in the preview environment.
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle session expiration (401 errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login if unauthorized
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- AUTH CONTEXT LOGIC ---

const AuthContext = createContext();

/**
 * AuthProvider Component:
 * Wraps the entire application to provide user authentication state.
 * It manages the 'user' object and 'loading' status globally.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a user is already logged in when the app starts
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const response = await apiClient.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error("Session expired or invalid token");
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Login function:
   * Takes credentials, calls the backend, and saves the JWT token.
   */
  const login = async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || "Login failed. Please try again." 
      };
    }
  };

  /**
   * Logout function:
   * Clears the token from local storage and resets the user state.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  /**
   * Register function:
   * Forwards the registration request to the backend.
   */
  const register = async (registrationData) => {
    try {
      const response = await apiClient.post('/auth/register', registrationData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || "Registration failed." 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook: useAuth
 * Allows any component to easily access auth functions like login/logout.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};