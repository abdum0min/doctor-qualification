import { ENDPOINTS, http } from '@/shared/api'
import type { DoctorProfilePayload } from '../model/schemas'
import type {
  DoctorOverview,
  DoctorProfile,
  DoctorPublicProfile,
} from '../model/types'

export const doctorsApi = {
  me: () => http.get<DoctorProfile>(ENDPOINTS.doctors.me),
  overview: () => http.get<DoctorOverview>(ENDPOINTS.doctors.overview),
  updateMe: (values: DoctorProfilePayload) =>
    http.patch<DoctorProfile>(ENDPOINTS.doctors.me, values),
  publicProfile: (doctorId: number) =>
    http.get<DoctorPublicProfile>(ENDPOINTS.doctors.byId(doctorId)),
}
