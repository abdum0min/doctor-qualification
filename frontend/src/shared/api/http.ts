import type { AxiosRequestConfig } from 'axios'

import { api } from './axios'
import { EMPTY_META, type ApiResponse, type Paginated } from './types'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise

  return response.data.data
}

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(api.get(url, config)),
  post: <T>(url: string, body?: unknown) => unwrap<T>(api.post(url, body)),
  patch: <T>(url: string, body?: unknown) => unwrap<T>(api.patch(url, body)),
  delete: <T>(url: string) => unwrap<T>(api.delete(url)),

  /**
   * Fayl yuborish uchun: Content-Type'ni brauzer o'zi qo'yadi (multipart
   * chegarasi bilan), import esa odatdagi so'rovdan uzoqroq davom etishi mumkin.
   */
  upload: <T>(url: string, form: FormData) =>
    unwrap<T>(
      api.post(url, form, {
        headers: { 'Content-Type': undefined },
        timeout: 120_000,
      }),
    ),

  async list<T>(url: string, params?: unknown): Promise<Paginated<T>> {
    const response = await api.get<ApiResponse<T[]>>(url, { params })

    return {
      items: response.data.data,
      meta: response.data.meta ?? EMPTY_META,
    }
  },
}
