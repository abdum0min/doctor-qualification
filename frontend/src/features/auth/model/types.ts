import type { UserRole } from '@/shared/config'

export type { UserRole }

export interface User {
  id: number
  fullname: string
  email: string
  role: UserRole
  isActive: boolean
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResult {
  accessToken: string
  tokenType: string
  expiresIn: string
  user: User
}
