import { create } from 'zustand'

import { tokenStorage } from '@/shared/lib/token-storage'
import type { User } from './types'

interface AuthState {
  user: User | null
  isReady: boolean
  setUser: (user: User | null) => void
  setReady: (isReady: boolean) => void
  signIn: (token: string, user: User) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isReady: false,

  setUser: (user) => set({ user }),
  setReady: (isReady) => set({ isReady }),

  signIn: (token, user) => {
    tokenStorage.set(token)
    set({ user, isReady: true })
  },

  signOut: () => {
    tokenStorage.clear()
    set({ user: null, isReady: true })
  },
}))

export const useCurrentUser = () => useAuthStore((state) => state.user)
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'ADMIN')
