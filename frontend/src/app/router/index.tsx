import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { HomePage } from '@/pages/home-page'
import { LoginPage } from '@/pages/login-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { ProfilePage } from '@/pages/profile-page'
import { RegisterPage } from '@/pages/register-page'
import { ROUTES } from '@/shared/config'
import { Spinner } from '@/shared/ui/spinner'
import { AuthLayout } from '../layouts/auth-layout'
import { DashboardLayout } from '../layouts/dashboard-layout'
import { GuestRoute, ProtectedRoute } from './guards'

// Design system barcha komponentlarni import qiladi — alohida chunk'ga ajratamiz,
// shunda asosiy bundle'ga tushmaydi. Og'ir sahifalarni shu qolipda yuklang.
const DesignSystemPage = lazy(() =>
  import('@/pages/design-system').then((module) => ({ default: module.DesignSystemPage })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}

export function AppRouter() {
  return (
    <Routes>
      {/* Faqat tizimga kirmaganlar uchun */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Token talab qilinadigan sahifalar */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
          <Route
            path={ROUTES.designSystem}
            element={
              <Suspense fallback={<RouteFallback />}>
                <DesignSystemPage />
              </Suspense>
            }
          />

          {/*
            Faqat admin uchun sahifalar shu qolipda qo'shiladi:
            <Route element={<AdminRoute />}>
              <Route path={ROUTES.users} element={<UsersPage />} />
            </Route>
          */}
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
