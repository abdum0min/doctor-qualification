import { useCallback, useMemo, useState } from 'react'

import { useDebounce } from './useDebounce'

interface TableQueryState {
  limit: number
  search: string
  debouncedSearch: string
  setSearch: (value: string) => void
  goNext: (cursor: string) => void
  goBack: () => void
  reset: () => void
  canGoBack: boolean
  params: { limit: number; cursor?: string; search?: string }
}

export function useTableQuery(limit = 10): TableQueryState {
  const [cursorStack, setCursorStack] = useState<string[]>([])
  const [search, setSearchValue] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const setSearch = useCallback((value: string) => {
    setSearchValue(value)
    setCursorStack([])
  }, [])

  const goNext = useCallback((cursor: string) => {
    setCursorStack((stack) => [...stack, cursor])
  }, [])

  const goBack = useCallback(() => {
    setCursorStack((stack) => stack.slice(0, -1))
  }, [])

  const reset = useCallback(() => {
    setCursorStack([])
  }, [])

  const cursor = cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : undefined

  const params = useMemo(
    () => ({
      limit,
      ...(cursor && { cursor }),
      ...(debouncedSearch && { search: debouncedSearch }),
    }),
    [limit, cursor, debouncedSearch],
  )

  return {
    limit,
    search,
    debouncedSearch,
    setSearch,
    goNext,
    goBack,
    reset,
    canGoBack: cursorStack.length > 0,
    params,
  }
}