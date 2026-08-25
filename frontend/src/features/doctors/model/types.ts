export interface DoctorSpecialty {
  id: number
  name: string
}

export interface DoctorProfile {
  id: number
  userId: number
  fullname: string
  email: string
  specialty: DoctorSpecialty | null
  phone: string | null
  workplace: string | null
  experienceYears: number | null
  createdAt: string
  updatedAt: string
}
