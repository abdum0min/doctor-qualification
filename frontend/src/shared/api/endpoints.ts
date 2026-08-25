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
    overview: '/doctors/me/overview',
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
  exams: {
    root: '/exams',
    all: '/exams/all',
    byId: (id: number) => `/exams/${id}`,
  },
  attempts: {
    root: '/attempts',
    byId: (id: number) => `/attempts/${id}`,
    answers: (id: number) => `/attempts/${id}/answers`,
    submit: (id: number) => `/attempts/${id}/submit`,
  },
  certificates: {
    root: '/certificates',
    verify: (certificateId: string) => `/certificates/verify/${certificateId}`,
    download: (certificateId: string) => `/certificates/${certificateId}/download`,
  },
  health: '/health',
} as const
