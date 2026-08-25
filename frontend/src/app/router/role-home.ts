import type { UserRole } from '@/features/auth'
import { ROUTES } from '@/shared/config'

/** Har bir rol o'zining boshlang'ich sahifasiga tushadi. */
export function roleHome(role: UserRole | undefined): string {
  return role === 'ADMIN' ? ROUTES.admin : ROUTES.dashboard
}
