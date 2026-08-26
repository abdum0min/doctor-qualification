import { useNavigate } from 'react-router-dom'

import { formatRelativeTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { useMarkNotificationRead } from '../api/notifications-queries'
import {
  NOTIFICATION_TYPE_LABELS,
  type AppNotification,
} from '../model/types'
import { NotificationIcon } from './notification-icon'

interface NotificationItemProps {
  notification: AppNotification
  /** Boshqaruv panelidagi qisqa ko'rinish — turi va matni yig'ilgan holda. */
  compact?: boolean
}

/**
 * Bosilganda xabar o'qilgan deb belgilanadi va havolasi bo'lsa o'sha
 * sahifaga o'tiladi. Ro'yxatda ham, panelda ham bir xil xulq.
 */
export function NotificationItem({
  notification,
  compact = false,
}: NotificationItemProps) {
  const navigate = useNavigate()
  const markRead = useMarkNotificationRead()

  function open() {
    if (!notification.readAt) {
      markRead.mutate(notification.id)
    }

    if (notification.link) {
      navigate(notification.link)
    }
  }

  const interactive = Boolean(notification.link) || !notification.readAt

  return (
    <button
      type="button"
      onClick={open}
      disabled={!interactive}
      className={cn(
        'flex w-full gap-3 rounded-lg px-2 py-2 text-left transition-colors',
        interactive && 'cursor-pointer hover:bg-accent/60',
        !notification.readAt && 'bg-primary/5',
      )}
    >
      <NotificationIcon type={notification.type} />

      <span className="min-w-0 flex-1 space-y-1">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              compact && 'block truncate',
            )}
          >
            {notification.title}
          </span>
          {!compact && (
            <Badge variant="secondary" className="text-[10px]">
              {NOTIFICATION_TYPE_LABELS[notification.type]}
            </Badge>
          )}
          {!notification.readAt && (
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </span>

        <span
          className={cn(
            'block text-sm text-muted-foreground',
            compact && 'line-clamp-2 text-xs',
          )}
        >
          {notification.body}
        </span>

        <span className="block text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>
    </button>
  )
}
