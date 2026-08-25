export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  isDev: import.meta.env.DEV,
} as const
