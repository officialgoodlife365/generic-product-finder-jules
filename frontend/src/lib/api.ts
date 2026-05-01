import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Use Vite env var if available, else proxy via Vite
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Since the final integration connects real backend DB routes, we remove the mocked 501 interceptor
export const fetcher = (url: string) => api.get(url).then(res => res.data);

export default api;
