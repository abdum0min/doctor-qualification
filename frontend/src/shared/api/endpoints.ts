/**
 * Barcha API manzillari bir joyda. Komponentlar ichiga xom qatorlar yozilmaydi —
 * backend yo'lni o'zgartirsa faqat shu fayl tahrirlanadi.
 */
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  doctors: {
    me: '/doctors/me',
  },
  specialties: {
    root: '/specialties',
    all: '/specialties/all',
    byId: (id: number) => `/specialties/${id}`,
  },
  questions: {
    root: '/questions',
    byId: (id: number) => `/questions/${id}`,
  },
  health: '/health',
} as const
