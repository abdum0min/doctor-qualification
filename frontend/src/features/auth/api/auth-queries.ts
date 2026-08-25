import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { ApiError } from '@/shared/api'
import { roleHome, ROUTES } from '@/shared/config'
import { queryClient } from '@/shared/lib/query-client'
import { tokenStorage } from '@/shared/lib/token-storage'
import { useAuthStore } from '../model/auth-store'
import type { LoginValues, RegisterValues } from '../model/schemas'
import { authApi } from './auth-api'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

/**
 * Token mavjud bo'lsa `/auth/me` orqali sessiyani tiklaydi.
 * `ProtectedRoute` shu query natijasiga tayanadi.
 */
export function useSession() {
  const setUser = useAuthStore((state) => state.setUser)
  const setReady = useAuthStore((state) => state.setReady)

  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const user = await authApi.me()
      setUser(user)
      setReady(true)
      return user
    },
    enabled: Boolean(tokenStorage.get()),
    retry: false,
    staleTime: Infinity,
  })
}

export function useLogin() {
  const navigate = useNavigate()
  const signIn = useAuthStore((state) => state.signIn)

  return useMutation({
    mutationFn: (values: LoginValues) => authApi.login(values),
    onSuccess: (result) => {
      signIn(result.accessToken, result.user)
      toast.success(`Xush kelibsiz, ${result.user.fullname}`)
      navigate(roleHome(result.user.role), { replace: true })
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const signIn = useAuthStore((state) => state.signIn)

  return useMutation({
    mutationFn: (values: RegisterValues) => authApi.register(values),
    onSuccess: (result) => {
      // Backend ro'yxatdan o'tgan zahoti token qaytaradi — qayta login shart emas.
      signIn(result.accessToken, result.user)
      toast.success('Hisobingiz yaratildi')
      navigate(roleHome(result.user.role), { replace: true })
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const signOut = useAuthStore((state) => state.signOut)

  return useMutation({
    mutationFn: () => authApi.logout(),
    // `onSettled` — server xato bersa ham mijozda chiqib ketiladi.
    onSettled: () => {
      signOut()
      queryClient.clear()
      navigate(ROUTES.login, { replace: true })
    },
  })
}
