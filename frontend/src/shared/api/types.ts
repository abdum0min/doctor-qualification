export interface ApiError {
  status: number
  message: string
  errors?: string[]
}

export interface PaginationMeta {
  limit: number
  nextCursor: string | null
  hasMore: boolean
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
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  cursor?: string
}

export const EMPTY_META: PaginationMeta = {
  limit: 10,
  nextCursor: null,
  hasMore: false,
}
