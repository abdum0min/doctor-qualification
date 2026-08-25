import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 p-6 text-center">
      <p className="text-6xl font-semibold tracking-tight text-muted-foreground">404</p>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Sahifa topilmadi</h1>
        <p className="text-sm text-muted-foreground">
          Siz qidirgan sahifa mavjud emas yoki ko'chirilgan.
        </p>
      </div>

      <Button asChild>
        <Link to={ROUTES.home}>Bosh sahifaga qaytish</Link>
      </Button>
    </div>
  )
}
