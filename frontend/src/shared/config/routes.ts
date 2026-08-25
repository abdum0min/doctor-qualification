export const ROUTES = {
  // Ochiq
  home: '/',
  login: '/login',
  register: '/register',

  // Shifokor (DOCTOR)
  dashboard: '/dashboard',
  exams: '/exams',
  attempt: '/attempts/:attemptId',
  profile: '/profile',

  // Administrator (ADMIN)
  admin: '/admin',
  adminSpecialties: '/admin/specialties',
  adminQuestions: '/admin/questions',
  adminExams: '/admin/exams',
  designSystem: '/design-system',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

/** Parametrli yo`llar uchun quruvchilar — xom qator birlashtirish o`rniga. */
export const buildRoute = {
  attempt: (attemptId: number) => `/attempts/${attemptId}`,
} as const
