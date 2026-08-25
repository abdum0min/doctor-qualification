export interface ApiError {
  status: number
  message: string
  errors?: string[]
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  meta?: PaginationMeta
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortOrder?: 'asc' | 'desc'
}

export const EMPTY_META: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
}
