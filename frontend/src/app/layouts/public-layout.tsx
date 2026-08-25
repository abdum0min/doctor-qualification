import { Link, Outlet } from 'react-router-dom'

import { useCurrentUser } from '@/features/auth'
import { APP, ROUTES } from '@/shared/config'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { roleHome } from '../router/role-home'

export function PublicLayout() {
  const user = useCurrentUser()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to={ROUTES.home} className="flex items-center">
            <BrandLogo />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <Button asChild size="sm">
                <Link to={roleHome(user.role)}>Kabinet</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to={ROUTES.login}>Kirish</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to={ROUTES.register}>Ro'yxatdan o'tish</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} {APP.name}
          </span>
          <span>{APP.tagline}</span>
        </div>
      </footer>
    </div>
  )
}
