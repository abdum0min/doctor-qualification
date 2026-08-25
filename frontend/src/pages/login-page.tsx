import { Link } from 'react-router-dom'

import { LoginForm } from '@/features/auth'
import { ROUTES } from '@/shared/config'

export function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tizimga kirish</h1>
        <p className="text-sm text-muted-foreground">Hisobingizga kiring</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        Hisobingiz yo'qmi?{' '}
        <Link to={ROUTES.register} className="font-medium text-primary hover:underline">
          Ro'yxatdan o'ting
        </Link>
      </p>
    </div>
  )
}
