import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import type { AuthTokens } from "../types";

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3233";

const STORAGE_ACCESS = "perkd_access_token";
const STORAGE_REFRESH = "perkd_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_ACCESS);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_REFRESH);
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_ACCESS, tokens.accessToken);
  localStorage.setItem(STORAGE_REFRESH, tokens.refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_ACCESS);
  localStorage.removeItem(STORAGE_REFRESH);
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach bearer token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

// Response interceptor — refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        processQueue(error, null);
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Fetch auth config to get token URL + clientId
        const configRes = await axios.get<{ tokenUrl: string; clientId: string }>(
          `${BASE_URL}/auth-config`
        );
        const { tokenUrl, clientId } = configRes.data;

        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("client_id", clientId);
        params.append("refresh_token", refreshToken);

        const tokenRes = await axios.post<{
          access_token: string;
          refresh_token: string;
          expires_in: number;
        }>(tokenUrl, params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const newTokens: AuthTokens = {
          accessToken: tokenRes.data.access_token,
          refreshToken: tokenRes.data.refresh_token,
          expiresIn: tokenRes.data.expires_in,
        };

        setTokens(newTokens);
        processQueue(null, newTokens.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        processQueue(refreshError, null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
