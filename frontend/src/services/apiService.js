import axios from "axios";

const API_URL = "https://chd-ai-backend.onrender.com";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to request headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token and user from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      details: error.response?.data?.error,
    });
  }
);

// API service methods
export const apiService = {
  // GET request
  get: (url, params = {}, config = {}) => {
    return axiosInstance.get(url, { params, ...config });
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return axiosInstance.post(url, data, config);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return axiosInstance.put(url, data, config);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return axiosInstance.delete(url, config);
  },

  // Upload files
  upload: (url, formData, onProgress, config = {}) => {
    const token = localStorage.getItem("token");
    return axiosInstance.post(url, formData, {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...config.headers,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};
