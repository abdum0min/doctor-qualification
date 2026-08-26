import { ENDPOINTS, http } from '@/shared/api'
import type {
  PlatformOverview,
  PlatformTrends,
  PublicStatistics,
  SpecialtyStatistics,
} from '../model/types'

export const statisticsApi = {
  overview: () => http.get<PlatformOverview>(ENDPOINTS.statistics.overview),
  bySpecialty: () => http.get<SpecialtyStatistics[]>(ENDPOINTS.statistics.specialties),
  publicSummary: () => http.get<PublicStatistics>(ENDPOINTS.statistics.public),
  trends: () => http.get<PlatformTrends>(ENDPOINTS.statistics.trends),
}
