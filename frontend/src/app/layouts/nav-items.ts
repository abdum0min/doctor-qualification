import {
  LayoutDashboard,
  Palette,
  ClipboardList,
  Award,
  GraduationCap,
  FileQuestion,
  Stethoscope,
  User,
  type LucideIcon,
} from 'lucide-react'

import type { UserRole } from '@/features/auth'
import { ROUTES } from '@/shared/config'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const DOCTOR_NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Boshqaruv paneli', icon: LayoutDashboard },
  { to: ROUTES.exams, label: 'Imtihonlar', icon: GraduationCap },
  { to: ROUTES.certificates, label: 'Sertifikatlar', icon: Award },
  { to: ROUTES.profile, label: 'Profil', icon: User },
]

const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: ROUTES.admin, label: 'Boshqaruv paneli', icon: LayoutDashboard },
  { to: ROUTES.adminSpecialties, label: 'Mutaxassisliklar', icon: Stethoscope },
  { to: ROUTES.adminQuestions, label: 'Savollar', icon: FileQuestion },
  { to: ROUTES.adminExams, label: 'Imtihonlar', icon: ClipboardList },
  { to: ROUTES.designSystem, label: 'Design System', icon: Palette },
]

export function navItemsForRole(role: UserRole | undefined): NavItem[] {
  return role === 'ADMIN' ? ADMIN_NAV_ITEMS : DOCTOR_NAV_ITEMS
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  DOCTOR: 'Shifokor',
}
