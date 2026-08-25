import axios, { AxiosError, type AxiosInstance } from 'axios'

import { env } from '@/shared/config/env'
import { tokenStorage } from '@/shared/lib/token-storage'
import type { ApiError } from './types'

export const api: AxiosInstance = axios.create({
  baseURL: `${env.apiUrl}/api`,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
    }

    const raw = error.response?.data?.message

    const normalized: ApiError = {
      status: error.response?.status ?? 0,
      message: Array.isArray(raw) ? raw[0] : (raw ?? error.message),
    }

    return Promise.reject(normalized)
  },
)
