import { ENDPOINTS, http, type PaginationParams } from '@/shared/api'
import type {
  Attempt,
  AttemptQuestion,
  AttemptStatus,
  AttemptSummary,
} from '../model/types'

export interface SaveAnswerInput {
  attemptId: number
  attemptQuestionId: number
  attemptOptionId: number | null
}

export type AttemptHistoryParams = PaginationParams & {
  examId?: number
  status?: AttemptStatus
}

export const attemptsApi = {
  history: (params: AttemptHistoryParams) =>
    http.list<AttemptSummary>(ENDPOINTS.attempts.root, params),
  start: (examId: number) => http.post<Attempt>(ENDPOINTS.attempts.root, { examId }),
  byId: (id: number) => http.get<Attempt>(ENDPOINTS.attempts.byId(id)),
  saveAnswer: ({ attemptId, ...body }: SaveAnswerInput) =>
    http.patch<AttemptQuestion>(ENDPOINTS.attempts.answers(attemptId), body),
  submit: (id: number) => http.post<Attempt>(ENDPOINTS.attempts.submit(id)),
}
