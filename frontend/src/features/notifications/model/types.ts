import type { QualificationLevel } from '@/features/attempts'
import type { PaginationParams } from '@/shared/api'

export const NOTIFICATION_TYPES = [
  'EXAM_PUBLISHED',
  'CERTIFICATE_ISSUED',
  'CERTIFICATE_REVOKED',
  'SYSTEM',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  EXAM_PUBLISHED: 'Yangi imtihon',
  CERTIFICATE_ISSUED: 'Sertifikat',
  CERTIFICATE_REVOKED: 'Bekor qilindi',
  SYSTEM: 'Eʼlon',
}

export interface AppNotification {
  id: number
  type: NotificationType
  title: string
  body: string
  link: string | null
  readAt: string | null
  createdAt: string
}

export interface UnreadCount {
  unread: number
}

export type NotificationParams = PaginationParams & {
  unreadOnly?: boolean
}

export interface Announcement {
  id: number
  title: string
  body: string
  link: string | null
  audience: string
  recipientCount: number
  sentBy: string | null
  createdAt: string
}

export interface AudiencePreview {
  recipientCount: number
  audience: string
}

export interface AudienceFilter {
  specialtyId?: number
  qualification?: QualificationLevel
}

export type SendAnnouncementPayload = AudienceFilter & {
  title: string
  body: string
  link?: string | null
}
