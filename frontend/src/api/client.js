import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[API Error]', error);
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
      status: error.response?.status,
      original: error,
    };
    if (customError.status === 401) {
      console.warn('Unauthorized. Please log in.');
    }
    return Promise.reject(customError);
  }
);

export default apiClient;
