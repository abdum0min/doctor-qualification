import { ENDPOINTS, http } from '@/shared/api'
import type { ExamPayload } from '../model/schemas'
import type { AdminExam, Exam, ExamStatus } from '../model/types'

interface ExamListParams {
  specialtyId?: number
  status?: ExamStatus
}

export const examsApi = {
  active: (params?: ExamListParams) => http.get<Exam[]>(ENDPOINTS.exams.root, { params }),
  all: (params?: ExamListParams) => http.get<AdminExam[]>(ENDPOINTS.exams.all, { params }),
  byId: (id: number) => http.get<Exam>(ENDPOINTS.exams.byId(id)),
  create: (body: ExamPayload) => http.post<Exam>(ENDPOINTS.exams.root, body),
  update: (id: number, body: Partial<ExamPayload>) =>
    http.patch<Exam>(ENDPOINTS.exams.byId(id), body),
}
