// API client for making requests to backend APIs
// Usage: import { apiClient } from '@/lib/apiClient'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '/api'
  }

  private getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          error: result.message || result.error || 'Request failed',
          message: result.message || result.error,
        }
      }

      return { data: result }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          error: result.message || result.error || 'Request failed',
          message: result.message || result.error,
        }
      }

      return { data: result }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          error: result.message || result.error || 'Request failed',
          message: result.message || result.error,
        }
      }

      return { data: result }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          error: result.message || result.error || 'Request failed',
          message: result.message || result.error,
        }
      }

      return { data: result }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()