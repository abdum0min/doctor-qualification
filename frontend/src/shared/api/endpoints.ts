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
    byExam: (examId: number) => `/admin/exams/${examId}/questions`,
    byId: (examId: number, id: number) =>
      `/admin/exams/${examId}/questions/${id}`,
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
    all: '/certificates/all',
    revoke: (certificateId: string) => `/certificates/${certificateId}/revoke`,
    verify: (certificateId: string) => `/certificates/verify/${certificateId}`,
    download: (certificateId: string) => `/certificates/${certificateId}/download`,
  },
  rankings: {
    root: '/rankings',
    top: '/rankings/top',
    me: '/rankings/me',
  },
  notifications: {
    root: '/notifications',
    unreadCount: '/notifications/unread-count',
    readAll: '/notifications/read-all',
    read: (id: number) => `/notifications/${id}/read`,
  },
  announcements: {
    root: '/admin/announcements',
    audience: '/admin/announcements/audience',
  },
  statistics: {
    overview: '/statistics/overview',
    specialties: '/statistics/specialties',
    public: '/statistics/public',
  },
  admin: {
    doctors: '/admin/doctors',
    doctorById: (id: number) => `/admin/doctors/${id}`,
    doctorStatus: (id: number) => `/admin/doctors/${id}/status`,
    attempts: '/admin/attempts',
    attemptById: (id: number) => `/admin/attempts/${id}`,
  },
  health: '/health',
} as const
