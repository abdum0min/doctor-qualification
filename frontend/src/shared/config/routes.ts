import type { UserRole } from './roles'

export const ROUTES = {
  // Ochiq
  home: '/',
  login: '/login',
  register: '/register',
  verify: '/verify/:certificateId',

  // Shifokor (DOCTOR)
  dashboard: '/dashboard',
  exams: '/exams',
  attempt: '/attempts/:attemptId',
  ranking: '/ranking',
  certificates: '/certificates',
  profile: '/profile',

  // Administrator (ADMIN)
  admin: '/admin',
  adminDoctors: '/admin/doctors',
  adminSpecialties: '/admin/specialties',
  adminExams: '/admin/exams',
  adminExamQuestions: '/admin/exams/:examId/questions',
  adminRankings: '/admin/rankings',
  adminAttempts: '/admin/attempts',
  adminCertificates: '/admin/certificates',
  designSystem: '/design-system',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

/** Har bir rol o`zining boshlang`ich sahifasiga tushadi. */
export function roleHome(role: UserRole | undefined): string {
  return role === 'ADMIN' ? ROUTES.admin : ROUTES.dashboard
}

/** Parametrli yo`llar uchun quruvchilar — xom qator birlashtirish o`rniga. */
export const buildRoute = {
  attempt: (attemptId: number) => `/attempts/${attemptId}`,
  verify: (certificateId: string) => `/verify/${certificateId}`,
  examQuestions: (examId: number) => `/admin/exams/${examId}/questions`,
} as const
