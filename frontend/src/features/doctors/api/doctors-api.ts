import { ENDPOINTS, http } from '@/shared/api'
import type { DoctorProfilePayload } from '../model/schemas'
import type { DoctorProfile } from '../model/types'

export const doctorsApi = {
  me: () => http.get<DoctorProfile>(ENDPOINTS.doctors.me),
  updateMe: (values: DoctorProfilePayload) =>
    http.patch<DoctorProfile>(ENDPOINTS.doctors.me, values),
}
