import axios from 'axios';

export const API_URL = 'http://localhost:5000';   // used for poster image links

const api = axios.create({ baseURL: API_URL + '/api' });

// Runs before EVERY request: attach the login token if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;