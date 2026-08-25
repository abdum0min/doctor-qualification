import { Home, Palette, User, type LucideIcon } from 'lucide-react'

import { ROUTES } from '@/shared/config'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** `true` bo'lsa element faqat ADMIN rolida ko'rinadi. */
  adminOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.home, label: 'Bosh sahifa', icon: Home },
  { to: ROUTES.profile, label: 'Profil', icon: User },
  { to: ROUTES.designSystem, label: 'Design System', icon: Palette },
]
