export type UserRole = 'ADMIN' | 'USER'

export interface User {
  id: number
  fullname: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResult {
  accessToken: string
  tokenType: string
  expiresIn: string
  user: User
}
