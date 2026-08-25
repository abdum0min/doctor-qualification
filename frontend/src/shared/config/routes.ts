export const ROUTES = {
  // Ochiq
  home: '/',
  login: '/login',
  register: '/register',

  // Shifokor (DOCTOR)
  dashboard: '/dashboard',
  profile: '/profile',

  // Administrator (ADMIN)
  admin: '/admin',
  adminSpecialties: '/admin/specialties',
  designSystem: '/design-system',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
