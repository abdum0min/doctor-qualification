import { ENDPOINTS, http } from '@/shared/api'
import type { Attempt, AttemptQuestion } from '../model/types'

export interface SaveAnswerInput {
  attemptId: number
  attemptQuestionId: number
  attemptOptionId: number | null
}

export const attemptsApi = {
  start: (examId: number) => http.post<Attempt>(ENDPOINTS.attempts.root, { examId }),
  byId: (id: number) => http.get<Attempt>(ENDPOINTS.attempts.byId(id)),
  saveAnswer: ({ attemptId, ...body }: SaveAnswerInput) =>
    http.patch<AttemptQuestion>(ENDPOINTS.attempts.answers(attemptId), body),
  submit: (id: number) => http.post<Attempt>(ENDPOINTS.attempts.submit(id)),
}
