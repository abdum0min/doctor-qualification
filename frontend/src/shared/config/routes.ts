export const ROUTES = {
  // Ochiq — faqat mehmonlar uchun (GuestRoute)
  login: '/login',
  register: '/register',

  // Himoyalangan — token talab qilinadi (ProtectedRoute)
  home: '/',
  profile: '/profile',
  designSystem: '/design-system',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
