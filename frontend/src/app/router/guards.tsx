import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore, useSession, type UserRole } from '@/features/auth'
import { ROUTES } from '@/shared/config'
import { tokenStorage } from '@/shared/lib/token-storage'
import { Spinner } from '@/shared/ui/spinner'
import { roleHome } from './role-home'

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}

/**
 * Token bo'lmasa yoki `/auth/me` xato qaytarsa — login sahifasiga.
 * Sessiya yuklanayotganda bo'sh ekran emas, loader ko'rsatiladi.
 */
export function ProtectedRoute() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const { isLoading, isError } = useSession()

  if (!tokenStorage.get() || isError) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />
  }

  if (isLoading || !user) {
    return <FullPageLoader />
  }

  return <Outlet />
}

/** Login/Register — allaqachon kirgan foydalanuvchini o'z sahifasiga qaytaradi. */
export function GuestRoute() {
  return tokenStorage.get() ? <Navigate to={ROUTES.home} replace /> : <Outlet />
}

function RoleRoute({ role }: { role: UserRole }) {
  const user = useAuthStore((state) => state.user)

  return user?.role === role ? <Outlet /> : <Navigate to={roleHome(user?.role)} replace />
}

export function AdminRoute() {
  return <RoleRoute role="ADMIN" />
}

export function DoctorRoute() {
  return <RoleRoute role="DOCTOR" />
}

/** `/` — rolga qarab tegishli boshlang'ich sahifaga yo'naltiradi. */
export function RoleHomeRedirect() {
  const user = useAuthStore((state) => state.user)

  return <Navigate to={roleHome(user?.role)} replace />
}
