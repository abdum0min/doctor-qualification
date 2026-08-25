import { Link, Outlet } from 'react-router-dom'

import { useCurrentUser } from '@/features/auth'
import { APP, roleHome, ROUTES } from '@/shared/config'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

/** Bosh sahifadagi bo'limlarga ichki havolalar. */
const NAV_LINKS = [
  { href: '/', label: 'Bosh sahifa' },
  { href: '#specialties', label: 'Mutaxassisliklar' },
  { href: '#how-it-works', label: 'Qanday ishlaydi' },
  { href: '#statistics', label: 'Statistika' },
  { href: '#contact', label: 'Aloqa' },
]

export function PublicLayout() {
  const user = useCurrentUser()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to={ROUTES.home} className="flex items-center">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <Button asChild size="sm">
                <Link to={roleHome(user.role)}>Kabinet</Link>
              </Button>
            ) : (
              <>
                {/* Kichik ekranda ikkala tugma sig'maydi — asosiysi qoladi. */}
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
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
