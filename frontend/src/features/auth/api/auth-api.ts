import { ENDPOINTS, http } from '@/shared/api'
import type { LoginValues, RegisterValues } from '../model/schemas'
import type { AuthResult, User } from '../model/types'

export const authApi = {
  login: (values: LoginValues) => http.post<AuthResult>(ENDPOINTS.auth.login, values),
  register: (values: RegisterValues) =>
    http.post<AuthResult>(ENDPOINTS.auth.register, values),
  me: () => http.get<User>(ENDPOINTS.auth.me),
  logout: () => http.post<null>(ENDPOINTS.auth.logout),
}
