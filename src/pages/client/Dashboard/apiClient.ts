// Frontend/src/services/api/apiClient.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

// Types
interface ApiError {
    success: false;
    message: string;
    error?: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

// Extend AxiosRequestConfig to include metadata for timing
declare module 'axios' {
    export interface AxiosRequestConfig {
        metadata?: {
            startTime: number;
        };
    }
}

class ApiClient {
    private client: AxiosInstance;
    private baseURL: string;

    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token if available - check for client token specifically
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add request timestamp for debugging
                config.metadata = { startTime: Date.now() };

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                // Log response time in development
                if (import.meta.env.DEV && response.config.metadata) {
                    const duration = Date.now() - response.config.metadata.startTime;
                    console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
                }

                return response;
            },
            (error: AxiosError<ApiError>) => {
                this.handleApiError(error);
                return Promise.reject(error);
            }
        );
    }

    private getAuthToken(): string | null {
        // Check for client token first, then fallback to others
        return localStorage.getItem('clientToken') ||
            localStorage.getItem('adminToken') ||
            localStorage.getItem('superadminToken') ||
            localStorage.getItem('agentToken');
    }

    private handleApiError(error: AxiosError<ApiError>) {
        let errorMessage = 'An unexpected error occurred';

        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    errorMessage = data?.message || 'Bad request';
                    break;
                case 401:
                    errorMessage = 'Authentication required';
                    this.handleUnauthorized();
                    break;
                case 403:
                    errorMessage = 'Access forbidden';
                    break;
                case 404:
                    errorMessage = 'Resource not found';
                    break;
                case 422:
                    errorMessage = data?.message || 'Validation error';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
                case 500:
                    errorMessage = 'Internal server error';
                    break;
                case 503:
                    errorMessage = 'Service unavailable';
                    break;
                default:
                    errorMessage = data?.message || `Error ${status}`;
            }
        } else if (error.request) {
            // Network error
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Please check your connection.';
            } else {
                errorMessage = 'Network error. Please check your connection.';
            }
        }

        // Show error toast (except for 401 which is handled separately)
        if (error.response?.status !== 401) {
            toast.error(errorMessage);
        }

        // Log error in development
        if (import.meta.env.DEV) {
            console.error('API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                message: errorMessage,
                data: error.response?.data
            });
        }
    }

    private handleUnauthorized() {
        // Clear auth tokens based on your existing auth structure
        localStorage.removeItem('clientToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('superadminToken');
        localStorage.removeItem('agentToken');
        localStorage.removeItem('clientUser');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('superadminUser');
        localStorage.removeItem('agentUser');

        // Redirect to login
        window.location.href = '/';

        toast.error('Session expired. Please login again.');
    }

    // HTTP Methods
    async get<T = any>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
        return this.client.get(url, config);
    }

    async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
        return this.client.post(url, data, config);
    }

    async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
        return this.client.put(url, data, config);
    }

    async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
        return this.client.patch(url, data, config);
    }

    async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
        return this.client.delete(url, config);
    }

    // File upload helper
    async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<AxiosResponse<ApiResponse<T>>> {
        const formData = new FormData();
        formData.append('file', file);

        return this.client.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });
    }

    // Batch requests helper
    async batch<T = any>(requests: Array<() => Promise<AxiosResponse<ApiResponse<T>>>>): Promise<AxiosResponse<ApiResponse<T>>[]> {
        try {
            const responses = await Promise.all(requests.map(request => request()));
            return responses;
        } catch (error) {
            console.error('Batch request failed:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.client.get('/health', { timeout: 5000 });
            return response.data.success;
        } catch (error) {
            return false;
        }
    }

    // Get base URL for external use
    getBaseURL(): string {
        return this.baseURL;
    }

    // Update auth token
    setAuthToken(token: string, userType: 'client' | 'admin' | 'superadmin' | 'agent' = 'client'): void {
        localStorage.setItem(`${userType}Token`, token);
    }

    // Clear auth token
    clearAuthToken(userType?: 'client' | 'admin' | 'superadmin' | 'agent'): void {
        if (userType) {
            localStorage.removeItem(`${userType}Token`);
            localStorage.removeItem(`${userType}User`);
        } else {
            // Clear all tokens
            localStorage.removeItem('clientToken');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('superadminToken');
            localStorage.removeItem('agentToken');
            localStorage.removeItem('clientUser');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('superadminUser');
            localStorage.removeItem('agentUser');
        }
    }
}

// Create and export the singleton instance
export const apiClient = new ApiClient();

// Export types for external use
export type { ApiError, ApiResponse };