import { useMemo, useState, type ReactNode } from 'react'
import { Bell, LogOut, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { useCurrentUser, useIsAdmin, useLogout } from '@/features/auth'
import { getInitials } from '@/shared/lib/format'
import { APP, ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { BrandLogo, BrandMark } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { NAV_ITEMS, type NavItem } from './nav-items'

const COLLAPSED_KEY = 'app_sidebar_collapsed'

function isRouteActive(pathname: string, target: string): boolean {
  if (target === '/') return pathname === target
  return pathname === target || pathname.startsWith(`${target}/`)
}

function CollapsibleLabel({
  collapsed,
  label,
  children,
}: {
  collapsed: boolean
  label: string
  children: ReactNode
}) {
  if (!collapsed) return children

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function SidebarNav({
  collapsed = false,
  items,
  onNavigate,
}: {
  collapsed?: boolean
  items: NavItem[]
  onNavigate?: () => void
}) {
  const logout = useLogout()
  const { pathname } = useLocation()

  const itemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors',
      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      collapsed && 'justify-center px-0',
      isActive &&
        'bg-sidebar-primary font-medium text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
    )

  return (
    <div className="flex flex-1 flex-col justify-between gap-4 overflow-y-auto p-3">
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <CollapsibleLabel key={item.to} collapsed={collapsed} label={item.label}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              className={itemClass(isRouteActive(pathname, item.to))}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && item.label}
            </NavLink>
          </CollapsibleLabel>
        ))}
      </nav>

      <CollapsibleLabel collapsed={collapsed} label="Chiqish">
        <button type="button" onClick={() => logout.mutate()} className={itemClass(false)}>
          <LogOut className="size-4 shrink-0" />
          {!collapsed && 'Chiqish'}
        </button>
      </CollapsibleLabel>
    </div>
  )
}

function UserMenu() {
  const user = useCurrentUser()
  const logout = useLogout()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.fullname)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block text-sm leading-tight font-medium">{user.fullname}</span>
            <span className="block text-xs leading-tight text-muted-foreground">
              {user.role === 'ADMIN' ? 'Admin' : 'User'}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium">{user.fullname}</span>
          <span className="block text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => logout.mutate()}>
          <LogOut />
          Chiqish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === '1',
  )
  const { pathname } = useLocation()
  const isAdmin = useIsAdmin()

  const visibleItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin),
    [isAdmin],
  )

  const title =
    visibleItems.find((item) => isRouteActive(pathname, item.to))?.label ?? APP.name

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      localStorage.setItem(COLLAPSED_KEY, value ? '0' : '1')
      return !value
    })
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <Link
          to={ROUTES.home}
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-sidebar-border',
            collapsed ? 'justify-center px-0' : 'px-4',
          )}
        >
          <CollapsibleLabel collapsed={collapsed} label={APP.name}>
            {collapsed ? (
              <BrandMark />
            ) : (
              <BrandLogo className="text-sidebar-accent-foreground" />
            )}
          </CollapsibleLabel>
        </Link>

        <SidebarNav collapsed={collapsed} items={visibleItems} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menyu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
              <div className="flex h-14 items-center border-b border-sidebar-border px-4">
                <SheetTitle asChild>
                  <Link
                    to={ROUTES.home}
                    className="flex items-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    <BrandLogo className="text-sidebar-accent-foreground" />
                  </Link>
                </SheetTitle>
              </div>
              <SidebarNav items={visibleItems} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            aria-label={collapsed ? 'Menyuni ochish' : 'Menyuni yig`ish'}
            aria-pressed={collapsed}
            onClick={toggleCollapsed}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>

          <h1 className="truncate text-sm font-semibold">{title}</h1>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            <Button variant="ghost" size="icon" className="relative" aria-label="Bildirishnomalar">
              <Bell />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
            </Button>

            <UserMenu />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
