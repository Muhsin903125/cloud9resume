import { useState, useEffect } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface FetchOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  skip?: boolean
}

export function useFetch<T = any>(url: string, options: FetchOptions = {}) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: !options.skip,
    error: null,
  })

  const { method = 'GET', body, headers, skip = false } = options

  useEffect(() => {
    if (skip) return

    let cancelled = false

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
          throw new Error(errorData.message || `HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!cancelled) {
          setState({ data, loading: false, error: null })
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
          setState({ data: null, loading: false, error: errorMessage })
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [url, method, JSON.stringify(body), JSON.stringify(headers), skip])

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
  }

  return {
    ...state,
    refetch,
  }
}
