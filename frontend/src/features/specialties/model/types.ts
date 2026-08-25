export interface Specialty {
  id: number
  name: string
  description: string | null
  isActive: boolean
}

export interface AdminSpecialty extends Specialty {
  doctorsCount: number
  createdAt: string
  updatedAt: string
}
