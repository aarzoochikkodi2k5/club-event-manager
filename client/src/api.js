import axios from 'axios';

// On your laptop this falls back to localhost.
// On Render we set VITE_API_URL to the live backend address.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL + '/api' });

// Runs before EVERY request: attach the login token if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;