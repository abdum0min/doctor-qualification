import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import {
  AdminDashboardPage,
  AdminExamsPage,
  AdminQuestionsPage,
  AdminSpecialtiesPage,
} from '@/pages/admin'
import { AttemptPage } from '@/pages/attempt-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { ExamsPage } from '@/pages/exams-page'
import { LoginPage } from '@/pages/login-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { ProfilePage } from '@/pages/profile-page'
import { RegisterPage } from '@/pages/register-page'
import { ROUTES } from '@/shared/config'
import { Spinner } from '@/shared/ui/spinner'
import { AuthLayout } from '../layouts/auth-layout'
import { DashboardLayout } from '../layouts/dashboard-layout'
import {
  AdminRoute,
  DoctorRoute,
  GuestRoute,
  ProtectedRoute,
  RoleHomeRedirect,
} from './guards'

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
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.home} element={<RoleHomeRedirect />} />

        <Route element={<DashboardLayout />}>
          <Route element={<DoctorRoute />}>
            <Route path={ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={ROUTES.exams} element={<ExamsPage />} />
            <Route path={ROUTES.attempt} element={<AttemptPage />} />
            <Route path={ROUTES.profile} element={<ProfilePage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path={ROUTES.admin} element={<AdminDashboardPage />} />
            <Route path={ROUTES.adminSpecialties} element={<AdminSpecialtiesPage />} />
            <Route path={ROUTES.adminQuestions} element={<AdminQuestionsPage />} />
            <Route path={ROUTES.adminExams} element={<AdminExamsPage />} />
            <Route
              path={ROUTES.designSystem}
              element={
                <Suspense fallback={<RouteFallback />}>
                  <DesignSystemPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
