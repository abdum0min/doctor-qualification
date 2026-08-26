import { ENDPOINTS, http } from '@/shared/api'
import type { SearchResult } from '../model/types'

export const searchApi = {
  query: (q: string, limit?: number) =>
    http.get<SearchResult>(ENDPOINTS.search, { params: { q, limit } }),
}
