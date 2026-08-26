import { useQuery } from '@tanstack/react-query'

import { statisticsApi } from './statistics-api'

export const statisticsKeys = {
  all: ['statistics'] as const,
  overview: ['statistics', 'overview'] as const,
  specialties: ['statistics', 'specialties'] as const,
  public: ['statistics', 'public'] as const,
  trends: ['statistics', 'trends'] as const,
}

export function usePlatformOverview() {
  return useQuery({
    queryKey: statisticsKeys.overview,
    queryFn: () => statisticsApi.overview(),
  })
}

export function useSpecialtyStatistics() {
  return useQuery({
    queryKey: statisticsKeys.specialties,
    queryFn: () => statisticsApi.bySpecialty(),
  })
}

export function usePublicStatistics() {
  return useQuery({
    queryKey: statisticsKeys.public,
    queryFn: () => statisticsApi.publicSummary(),
  })
}

export function usePlatformTrends() {
  return useQuery({
    queryKey: statisticsKeys.trends,
    queryFn: () => statisticsApi.trends(),
  })
}
