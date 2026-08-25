import { ENDPOINTS, http, type PaginationParams } from '@/shared/api'
import type { QuestionPayload } from '../model/schemas'
import type { Question, QuestionFilters } from '../model/types'

export type QuestionListParams = PaginationParams & QuestionFilters

export const questionsApi = {
  list: (examId: number, params: QuestionListParams) =>
    http.list<Question>(ENDPOINTS.questions.byExam(examId), params),
  create: (examId: number, body: QuestionPayload) =>
    http.post<Question>(ENDPOINTS.questions.byExam(examId), body),
  update: (examId: number, id: number, body: QuestionPayload) =>
    http.patch<Question>(ENDPOINTS.questions.byId(examId, id), body),
  remove: (examId: number, id: number) =>
    http.delete<null>(ENDPOINTS.questions.byId(examId, id)),
}
