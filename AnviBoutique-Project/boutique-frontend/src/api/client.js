import axios from 'axios';

/**
 * Central Axios instance for the Anvi Boutique API.
 * This handles base URLs, headers, and security tokens automatically.
 */
const apiClient = axios.create({
  // Use environment variable or default to localhost:8080
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Before every request is sent to the backend, check if we have a 
 * JWT token in localStorage. If yes, add it to the 'Authorization' header.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * This handles global error responses. For example, if the token expires (401),
 * we automatically clear local data and redirect to the login page.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response && response.status === 401) {
      // Unauthorized: Clear token and redirect to login
      localStorage.removeItem('token');
      // Using window.location to force a reload on auth failure
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;