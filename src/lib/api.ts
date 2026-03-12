const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

interface ApiResponse<T = unknown> {
  status: 'success' | 'error'
  message: string
  data: T
}

let accessToken: string | null = localStorage.getItem('access_token')
let refreshToken: string | null = localStorage.getItem('refresh_token')

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function getAccessToken() {
  return accessToken
}

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

async function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve)
    })
  }

  isRefreshing = true

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!res.ok) {
      clearTokens()
      window.location.href = '/login'
      throw new Error('Refresh failed')
    }

    const data = await res.json()
    const newToken = data.data.access_token
    const newRefresh = data.data.refresh_token

    setTokens(newToken, newRefresh)
    refreshQueue.forEach((cb) => cb(newToken))
    refreshQueue = []

    return newToken
  } finally {
    isRefreshing = false
  }
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken()
    headers['Authorization'] = `Bearer ${newToken}`
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })
  }

  const json = await res.json()

  if (!res.ok) {
    const errorMessage =
      json.message ||
      (json.messages && (json.messages.error || Object.values(json.messages)[0])) ||
      'Erro desconhecido'
    throw new ApiError(errorMessage, res.status, json)
  }

  return json
}

export async function uploadFile<T = unknown>(
  endpoint: string,
  file: File,
  fieldName: string = 'file'
): Promise<ApiResponse<T>> {
  const formData = new FormData()
  formData.append(fieldName, file)

  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken()
    headers['Authorization'] = `Bearer ${newToken}`
    res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })
  }

  const json = await res.json()

  if (!res.ok) {
    const errorMessage =
      json.message ||
      (json.messages && (json.messages.error || Object.values(json.messages)[0])) ||
      'Erro desconhecido'
    throw new ApiError(errorMessage, res.status, json)
  }

  return json
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}
