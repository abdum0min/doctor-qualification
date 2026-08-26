import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import type {
  AudienceFilter,
  NotificationParams,
  SendAnnouncementPayload,
} from '../model/types'
import { announcementsApi, notificationsApi } from './notifications-api'

/** O'qilmaganlar soni fonda shu oraliqda yangilanadi. */
const UNREAD_REFETCH_MS = 60_000

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: NotificationParams) =>
    [...notificationKeys.all, 'list', params] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
}

export const announcementKeys = {
  all: ['announcements'] as const,
  list: (params: object) => [...announcementKeys.all, 'list', params] as const,
  audience: (filter: AudienceFilter) =>
    [...announcementKeys.all, 'audience', filter] as const,
}

export function useNotifications(params: NotificationParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.list(params),
  })
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationsApi.unreadCount(),
    enabled,
    refetchInterval: UNREAD_REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}

function invalidateNotifications() {
  return queryClient.invalidateQueries({ queryKey: notificationKeys.all })
}

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => invalidateNotifications(),
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void invalidateNotifications()
      toast.success('Barcha xabarlar o`qilgan deb belgilandi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useAnnouncements(params: {
  page?: number
  limit?: number
  search?: string
}) {
  return useQuery({
    queryKey: announcementKeys.list(params),
    queryFn: () => announcementsApi.list(params),
  })
}

export function useAudiencePreview(filter: AudienceFilter) {
  return useQuery({
    queryKey: announcementKeys.audience(filter),
    queryFn: () => announcementsApi.audience(filter),
  })
}

export function useSendAnnouncement() {
  return useMutation({
    mutationFn: (body: SendAnnouncementPayload) => announcementsApi.send(body),
    onSuccess: (announcement) => {
      void queryClient.invalidateQueries({ queryKey: announcementKeys.all })
      toast.success(
        `Xabar ${announcement.recipientCount} ta shifokorga yuborildi`,
      )
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
