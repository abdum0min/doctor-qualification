import { ENDPOINTS, http } from '@/shared/api'
import type {
  Announcement,
  AppNotification,
  AudienceFilter,
  AudiencePreview,
  NotificationParams,
  SendAnnouncementPayload,
  UnreadCount,
} from '../model/types'

export const notificationsApi = {
  list: (params: NotificationParams) =>
    http.list<AppNotification>(ENDPOINTS.notifications.root, params),
  unreadCount: () => http.get<UnreadCount>(ENDPOINTS.notifications.unreadCount),
  markRead: (id: number) =>
    http.patch<AppNotification>(ENDPOINTS.notifications.read(id)),
  markAllRead: () => http.patch<UnreadCount>(ENDPOINTS.notifications.readAll),
}

export const announcementsApi = {
  list: (params: { page?: number; limit?: number; search?: string }) =>
    http.list<Announcement>(ENDPOINTS.announcements.root, params),
  audience: (filter: AudienceFilter) =>
    http.get<AudiencePreview>(ENDPOINTS.announcements.audience, {
      params: filter,
    }),
  send: (body: SendAnnouncementPayload) =>
    http.post<Announcement>(ENDPOINTS.announcements.root, body),
}
