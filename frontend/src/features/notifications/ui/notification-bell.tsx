import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/shared/config'
import { formatRelativeTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { Spinner } from '@/shared/ui/spinner'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from '../api/notifications-queries'
import type { AppNotification } from '../model/types'
import { NotificationIcon } from './notification-icon'

/** Qo'ng'iroq ostida faqat oxirgi bir nechta xabar ko'rsatiladi. */
const PREVIEW_LIMIT = 6

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const { data: unreadCount } = useUnreadCount()
  // Ro'yxat faqat panel ochilganda so'raladi — fon so'rovi faqat sanoq uchun.
  const { data, isLoading } = useNotifications({ page: 1, limit: PREVIEW_LIMIT })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const unread = unreadCount?.unread ?? 0
  const items = data?.items ?? []

  function openNotification(notification: AppNotification) {
    if (!notification.readAt) {
      markRead.mutate(notification.id)
    }

    setOpen(false)
    navigate(notification.link ?? ROUTES.notifications)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unread > 0
              ? `Bildirishnomalar — ${unread} ta o'qilmagan`
              : 'Bildirishnomalar'
          }
        >
          <Bell />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4.5 font-semibold text-white ring-2 ring-card">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-88 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <p className="text-sm font-semibold">Bildirishnomalar</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="size-3.5" />
              Barchasi o'qildi
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            Hozircha xabar yo'q
          </p>
        ) : (
          <ul className="max-h-88 overflow-y-auto">
            {items.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={cn(
                    'flex w-full gap-2.5 border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-accent',
                    !notification.readAt && 'bg-primary/5',
                  )}
                >
                  <NotificationIcon type={notification.type} />
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">
                        {notification.title}
                      </span>
                      {!notification.readAt && (
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="line-clamp-2 block text-xs text-muted-foreground">
                      {notification.body}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-border p-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              setOpen(false)
              navigate(ROUTES.notifications)
            }}
          >
            Barcha xabarlarni ko'rish
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
