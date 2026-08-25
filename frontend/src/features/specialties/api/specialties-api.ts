import { ENDPOINTS, http } from '@/shared/api'
import type { SpecialtyPayload } from '../model/schemas'
import type { AdminSpecialty, Specialty } from '../model/types'

interface SearchParams {
  search?: string
}

export const specialtiesApi = {
  active: (params?: SearchParams) =>
    http.get<Specialty[]>(ENDPOINTS.specialties.root, { params }),
  all: (params?: SearchParams) =>
    http.get<AdminSpecialty[]>(ENDPOINTS.specialties.all, { params }),
  create: (body: SpecialtyPayload) =>
    http.post<Specialty>(ENDPOINTS.specialties.root, body),
  update: (id: number, body: Partial<SpecialtyPayload>) =>
    http.patch<Specialty>(ENDPOINTS.specialties.byId(id), body),
}
