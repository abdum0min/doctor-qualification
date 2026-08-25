import { Outlet } from 'react-router-dom'

import { APP } from '@/shared/config'
import { AuthIllustration } from '@/shared/ui/auth-illustration'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30 lg:flex-row">
      <div className="flex flex-1 flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP.name}
        </p>
      </div>

      <div className="hidden flex-1 items-center justify-center bg-card p-12 lg:flex">
        <div className="max-w-md space-y-8 text-center">
          <AuthIllustration className="w-full" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">{APP.tagline}</h2>
            <p className="text-sm text-muted-foreground">{APP.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
