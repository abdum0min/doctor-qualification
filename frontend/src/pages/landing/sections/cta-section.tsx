import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useCurrentUser } from '@/features/auth'
import { roleHome, ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/button'

export function CtaSection() {
  const user = useCurrentUser()

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:px-10 lg:flex-row">
        <div className="space-y-2 text-center lg:text-left">
          <h2 className="text-xl font-semibold tracking-tight text-balance">
            Bilimingizni sinang va professional darajangizni tasdiqlang
          </h2>
          <p className="text-sm text-primary-foreground/80">
            Bugun imtihonga kiring va rasmiy sertifikatga ega bo'ling
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" variant="secondary">
            <Link to={user ? roleHome(user.role) : ROUTES.register}>
              <BookOpen />
              Imtihonga kirish
            </Link>
          </Button>

          {!user && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to={ROUTES.register}>Ro'yxatdan o'tish</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
