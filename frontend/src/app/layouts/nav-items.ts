import {
  Bell,
  LayoutDashboard,
  Megaphone,
  Settings,
  ClipboardList,
  Award,
  BarChart3,
  GraduationCap,
  Stethoscope,
  ClipboardList as ResultsIcon,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'

import type { UserRole } from '@/shared/config'
import { ROLE_LABELS, ROUTES } from '@/shared/config'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const DOCTOR_NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Boshqaruv paneli', icon: LayoutDashboard },
  { to: ROUTES.exams, label: 'Imtihonlar', icon: GraduationCap },
  { to: ROUTES.results, label: 'Natijalarim', icon: ResultsIcon },
  { to: ROUTES.ranking, label: 'Reyting', icon: Trophy },
  { to: ROUTES.certificates, label: 'Sertifikatlar', icon: Award },
  { to: ROUTES.notifications, label: 'Bildirishnomalar', icon: Bell },
  { to: ROUTES.profile, label: 'Profil', icon: User },
]

const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: ROUTES.admin, label: 'Boshqaruv paneli', icon: LayoutDashboard },
  { to: ROUTES.adminDoctors, label: 'Shifokorlar', icon: Users },
  { to: ROUTES.adminSpecialties, label: 'Mutaxassisliklar', icon: Stethoscope },
  { to: ROUTES.adminExams, label: 'Imtihonlar', icon: ClipboardList },
  { to: ROUTES.adminAttempts, label: 'Natijalar', icon: BarChart3 },
  { to: ROUTES.adminRankings, label: 'Reyting', icon: Trophy },
  { to: ROUTES.adminCertificates, label: 'Sertifikatlar', icon: Award },
  { to: ROUTES.adminAnnouncements, label: "E'lonlar", icon: Megaphone },
  { to: ROUTES.adminSettings, label: 'Sozlamalar', icon: Settings },
]

export function navItemsForRole(role: UserRole | undefined): NavItem[] {
  return role === 'ADMIN' ? ADMIN_NAV_ITEMS : DOCTOR_NAV_ITEMS
}

export { ROLE_LABELS }
