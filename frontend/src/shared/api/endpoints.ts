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
  health: '/health',
} as const
