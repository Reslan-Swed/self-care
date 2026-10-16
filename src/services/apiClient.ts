import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiErrorResponse, ApiError } from '../types/api';
import { triggerGlobalToast } from '../context/ToastContext';

const TOKEN_STORAGE_KEY = 'micropms_auth_token';
const TENANT_SLUG_KEY = 'micropms_tenant_slug';
const LANGUAGE_KEY = 'micropms_lang';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to persist auth token', e);
  }
}

export function getTenantSlug(): string | null {
  try {
    return localStorage.getItem(TENANT_SLUG_KEY);
  } catch {
    return null;
  }
}

export function setTenantSlug(slug: string | null) {
  try {
    if (slug) {
      localStorage.setItem(TENANT_SLUG_KEY, slug);
    } else {
      localStorage.removeItem(TENANT_SLUG_KEY);
    }
  } catch (e) {
    console.error('Failed to persist tenant slug', e);
  }
}

// Global hook for unauthorized event
type AuthEventHandler = () => void;
const onUnauthorizedListeners: Set<AuthEventHandler> = new Set();

export function subscribeToUnauthorized(callback: AuthEventHandler) {
  onUnauthorizedListeners.add(callback);
  return () => {
    onUnauthorizedListeners.delete(callback);
  };
}

/**
 * Production Axios instance preconfigured with Bearer JWT tokens,
 * multi-tenant headers, automatic ApiResponse<T> unwrapping, and centralized error handling.
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request Interceptor: Attach Bearer JWT, Tenant Slug, and Language
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantSlug = getTenantSlug();
    if (tenantSlug && config.headers) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
    }

    try {
      const lang = localStorage.getItem(LANGUAGE_KEY) || 'en';
      if (config.headers) {
        config.headers['Accept-Language'] = lang;
      }
    } catch {
      // ignore in SSR/restricted environments
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Unwraps ApiResponse<T> -> returns response.data.data
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // If backend returned our standard ApiResponse<T> envelope, unwrap to data
    if (response.data && typeof response.data === 'object' && 'code' in response.data && 'data' in response.data) {
      // Preserve envelope metadata as a non-enumerable property if needed
      const payload = response.data.data;
      if (payload && typeof payload === 'object') {
        Object.defineProperty(payload, '__envelope', {
          value: {
            code: response.data.code,
            message: response.data.message,
            timestamp: response.data.timestamp
          },
          enumerable: false,
          configurable: true
        });
      }
      return payload;
    }
    return response.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const errorData = error.response?.data;

    // Handle 401 Unauthorized
    if (status === 401) {
      triggerGlobalToast({
        type: 'warning',
        title: 'Session Expired',
        message: 'Your session has expired. Please sign in again.'
      });
      onUnauthorizedListeners.forEach((fn) => fn());
    }

    // Handle 403 Forbidden
    if (status === 403) {
      const message = errorData?.message || 'Access Denied: You do not have the required authorities to access this resource.';
      triggerGlobalToast({
        type: 'error',
        title: 'Access Denied (HTTP 403)',
        message
      });
    }

    // Wrap backend ApiErrorResponse with parsed field-level validation errors
    if (errorData && typeof errorData === 'object' && 'code' in errorData) {
      const apiError = new ApiError(errorData);
      return Promise.reject(apiError);
    }

    // Fallback error
    const fallbackError = new ApiError({
      code: status || 500,
      message: error.message || 'An unexpected network error occurred',
      timestamp: new Date().toISOString()
    });

    return Promise.reject(fallbackError);
  }
);

/**
 * Type-safe API Client helper functions
 */
export const apiClient = {
  get: <T = any>(url: string, params?: Record<string, any>): Promise<T> =>
    (axiosInstance.get(url, { params }) as unknown) as Promise<T>,

  post: <T = any>(url: string, data?: any): Promise<T> =>
    (axiosInstance.post(url, data) as unknown) as Promise<T>,

  put: <T = any>(url: string, data?: any): Promise<T> =>
    (axiosInstance.put(url, data) as unknown) as Promise<T>,

  patch: <T = any>(url: string, data?: any): Promise<T> =>
    (axiosInstance.patch(url, data) as unknown) as Promise<T>,

  delete: <T = any>(url: string): Promise<T> =>
    (axiosInstance.delete(url) as unknown) as Promise<T>
};

export default apiClient;
