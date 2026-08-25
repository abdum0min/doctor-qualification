import { useCallback, useMemo, useState } from 'react'

import { useDebounce } from './useDebounce'

interface TableQueryState {
  page: number
  limit: number
  search: string
  setPage: (page: number) => void
  setSearch: (value: string) => void
  /** Filtr o'zgarganda birinchi sahifaga qaytarish uchun. */
  resetPage: () => void
  params: { page: number; limit: number; search?: string }
}

/**
 * Ro'yxat sahifalari uchun server tomonlama sahifalash holati.
 * Qidiruv debounce qilinadi; qidiruv o'zgarganda sahifa 1 ga qaytadi.
 */
export function useTableQuery(limit = 10): TableQueryState {
  const [page, setPage] = useState(1)
  const [search, setSearchValue] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const setSearch = useCallback((value: string) => {
    setSearchValue(value)
    setPage(1)
  }, [])

  const resetPage = useCallback(() => setPage(1), [])

  const params = useMemo(
    () => ({
      page,
      limit,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, limit, debouncedSearch],
  )

  return { page, limit, search, setPage, setSearch, resetPage, params }
}
