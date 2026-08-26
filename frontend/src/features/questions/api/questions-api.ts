import { ENDPOINTS, http, type PaginationParams } from '@/shared/api'
import type { QuestionPayload } from '../model/schemas'
import type {
  ImportOptions,
  ImportResult,
  Question,
  QuestionFilters,
} from '../model/types'

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

  import: (examId: number, options: ImportOptions) => {
    const form = new FormData()
    form.append('file', options.file)

    if (options.skipInvalidRows) {
      form.append('skipInvalidRows', 'true')
    }

    if (options.defaultDifficulty) {
      form.append('defaultDifficulty', options.defaultDifficulty)
    }

    return http.upload<ImportResult>(ENDPOINTS.questions.import(examId), form)
  },
}
