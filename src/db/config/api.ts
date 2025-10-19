// src/db/config/api.ts
import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ponlo en false si usas sólo Authorization: Bearer <token>
  headers: { 'Content-Type': 'application/json' },
});

// ---- Opcional: proveedor de token (JWT) ----
let externalTokenProvider: (() => string | null) | null = null;
export function setTokenProvider(fn: () => string | null) {
  externalTokenProvider = fn;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // Asegura objeto antes del spread
    config.headers = config.headers || {};
    // Si es AxiosHeaders tendrás .set; si no, asigna como objeto
    if (typeof (config.headers as any).set === 'function') {
      (config.headers as any).set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});