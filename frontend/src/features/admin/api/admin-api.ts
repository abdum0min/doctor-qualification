import { ENDPOINTS, http } from '@/shared/api'
import type {
  AdminAttempt,
  AdminAttemptParams,
  AdminDoctor,
  AdminDoctorDetail,
  AdminDoctorParams,
} from '../model/types'

export const adminApi = {
  doctors: (params: AdminDoctorParams) =>
    http.list<AdminDoctor>(ENDPOINTS.admin.doctors, params),
  doctorById: (id: number) =>
    http.get<AdminDoctorDetail>(ENDPOINTS.admin.doctorById(id)),
  updateDoctorStatus: (id: number, isActive: boolean) =>
    http.patch<AdminDoctor>(ENDPOINTS.admin.doctorStatus(id), { isActive }),
  attempts: (params: AdminAttemptParams) =>
    http.list<AdminAttempt>(ENDPOINTS.admin.attempts, params),
}
