import { useState, useCallback } from 'react'

interface APIState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface APIOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

export function useAPI<T = any>() {
  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const request = useCallback(async (url: string, options: APIOptions = {}) => {
    setState({ data: null, loading: true, error: null })

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setState({ data, loading: false, error: null })
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setState({ data: null, loading: false, error: errorMessage })
      throw err
    }
  }, [])

  const get = useCallback((url: string, headers?: Record<string, string>) => {
    return request(url, { method: 'GET', headers })
  }, [request])

  const post = useCallback((url: string, body: any, headers?: Record<string, string>) => {
    return request(url, { method: 'POST', body, headers })
  }, [request])

  const put = useCallback((url: string, body: any, headers?: Record<string, string>) => {
    return request(url, { method: 'PUT', body, headers })
  }, [request])

  const del = useCallback((url: string, headers?: Record<string, string>) => {
    return request(url, { method: 'DELETE', headers })
  }, [request])

  return {
    ...state,
    request,
    get,
    post,
    put,
    delete: del,
  }
}
