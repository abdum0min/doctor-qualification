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
  certificates: '/certificates',
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
  verify: (certificateId: string) => `/verify/${certificateId}`,
} as const
