import { useQuery } from '@tanstack/react-query'

import { rankingsApi } from './rankings-api'
import type { RankingParams } from '../model/types'

export const rankingKeys = {
  all: ['rankings'] as const,
  list: (params: RankingParams) => [...rankingKeys.all, 'list', params] as const,
  top: (params: RankingParams) => [...rankingKeys.all, 'top', params] as const,
  me: (params: RankingParams) => [...rankingKeys.all, 'me', params] as const,
}

export function useRankings(params: RankingParams) {
  return useQuery({
    queryKey: rankingKeys.list(params),
    queryFn: () => rankingsApi.list(params),
  })
}

export function useTopDoctors(params: RankingParams = {}) {
  return useQuery({
    queryKey: rankingKeys.top(params),
    queryFn: () => rankingsApi.top(params),
  })
}

export function useMyRanking(params: RankingParams = {}) {
  return useQuery({
    queryKey: rankingKeys.me(params),
    queryFn: () => rankingsApi.me(params),
  })
}
