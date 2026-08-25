import { ENDPOINTS, http, type PaginationParams } from '@/shared/api'
import type { QuestionPayload } from '../model/schemas'
import type { Question, QuestionFilters } from '../model/types'

export type QuestionListParams = PaginationParams & QuestionFilters

export const questionsApi = {
  list: (params: QuestionListParams) =>
    http.list<Question>(ENDPOINTS.questions.root, params),
  create: (body: QuestionPayload) => http.post<Question>(ENDPOINTS.questions.root, body),
  update: (id: number, body: QuestionPayload) =>
    http.patch<Question>(ENDPOINTS.questions.byId(id), body),
  remove: (id: number) => http.delete<null>(ENDPOINTS.questions.byId(id)),
}
