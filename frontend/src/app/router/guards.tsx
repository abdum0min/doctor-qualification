import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore, useSession } from '@/features/auth'
import { ROUTES } from '@/shared/config'
import { tokenStorage } from '@/shared/lib/token-storage'
import { Spinner } from '@/shared/ui/spinner'

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

/** Login/Register — allaqachon kirgan foydalanuvchini bosh sahifaga qaytaradi. */
export function GuestRoute() {
  return tokenStorage.get() ? <Navigate to={ROUTES.home} replace /> : <Outlet />
}

/** Rolga qarab cheklov. `ProtectedRoute` ichida ishlatiladi. */
export function AdminRoute() {
  const user = useAuthStore((state) => state.user)

  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to={ROUTES.home} replace />
}
