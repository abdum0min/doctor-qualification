import { useQuery } from '@tanstack/react-query'

import { searchApi } from './search-api'

/** Backend ham shu chegarani talab qiladi — bittalik so`rov yuborilmasin. */
export const MIN_SEARCH_LENGTH = 2

export const searchKeys = {
  all: ['search'] as const,
  query: (q: string) => [...searchKeys.all, q] as const,
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: searchKeys.query(query),
    queryFn: () => searchApi.query(query),
    enabled: query.trim().length >= MIN_SEARCH_LENGTH,
    // Qidiruv oynasi qayta ochilganda oxirgi natija darhol ko'rinadi.
    staleTime: 30_000,
  })
}
