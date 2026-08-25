import { ENDPOINTS, http } from '@/shared/api'
import type { MyRanking, RankingParams, RankingRow } from '../model/types'

export const rankingsApi = {
  list: (params: RankingParams) =>
    http.list<RankingRow>(ENDPOINTS.rankings.root, params),
  top: (params: RankingParams) =>
    http.get<RankingRow[]>(ENDPOINTS.rankings.top, { params }),
  me: (params: RankingParams) =>
    http.get<MyRanking>(ENDPOINTS.rankings.me, { params }),
}
