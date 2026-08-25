import { Link } from 'react-router-dom'

import { RegisterForm } from '@/features/auth'
import { ROUTES } from '@/shared/config'

export function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ro'yxatdan o'tish</h1>
        <p className="text-sm text-muted-foreground">Yangi hisob yarating</p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        Hisobingiz bormi?{' '}
        <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
          Kirish
        </Link>
      </p>
    </div>
  )
}
