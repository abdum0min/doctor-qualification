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
  health: '/health',

  // 👇 Yangi resurslar shu qolipda qo'shiladi:
  // posts: {
  //   root: '/posts',
  //   byId: (id: number) => `/posts/${id}`,
  // },
} as const
