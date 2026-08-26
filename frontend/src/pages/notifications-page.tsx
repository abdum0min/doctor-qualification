import { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  NOTIFICATION_TYPE_LABELS,
  NotificationIcon,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type AppNotification,
} from '@/features/notifications'
import type { ApiError } from '@/shared/api'
import { formatRelativeTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { PageShell } from '@/shared/ui/page-shell'
import { TablePagination } from '@/shared/ui/table-pagination'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs'

const PAGE_SIZE = 15

export function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useNotifications({
    page,
    limit: PAGE_SIZE,
    ...(unreadOnly ? { unreadOnly: true } : {}),
  })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const items = data?.items ?? []
  const hasUnread = items.some((notification) => !notification.readAt)

  function openNotification(notification: AppNotification) {
    if (!notification.readAt) {
      markRead.mutate(notification.id)
    }

    if (notification.link) {
      navigate(notification.link)
    }
  }

  return (
    <PageShell
      title="Bildirishnomalar"
      description="Yangi imtihonlar, sertifikatlar va administrator e'lonlari"
      filters={
        <Tabs
          value={unreadOnly ? 'unread' : 'all'}
          onValueChange={(value) => {
            setUnreadOnly(value === 'unread')
            setPage(1)
          }}
        >
          <TabsList>
            <TabsTrigger value="all">Barchasi</TabsTrigger>
            <TabsTrigger value="unread">O'qilmagan</TabsTrigger>
          </TabsList>
        </Tabs>
      }
      action={
        hasUnread ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="size-4" />
            Barchasini o'qilgan deb belgilash
          </Button>
        ) : undefined
      }
    >
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
        isEmpty={items.length === 0}
        emptyTitle="Xabar yo'q"
        emptyDescription={
          unreadOnly
            ? "Barcha xabarlar o'qilgan."
            : 'Yangi imtihon ochilganda yoki sertifikat berilganda shu yerda ko`rasiz.'
        }
      >
        <ul className="divide-y divide-border">
          {items.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => openNotification(notification)}
                disabled={!notification.link && Boolean(notification.readAt)}
                className={cn(
                  'flex w-full gap-3 px-1 py-3 text-left transition-colors',
                  (notification.link || !notification.readAt) &&
                    'cursor-pointer hover:bg-accent/50',
                  !notification.readAt && 'bg-primary/5',
                )}
              >
                <NotificationIcon type={notification.type} />

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {NOTIFICATION_TYPE_LABELS[notification.type]}
                    </Badge>
                    {!notification.readAt && (
                      <span className="size-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.body}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {data && <TablePagination meta={data.meta} onPageChange={setPage} />}
      </AsyncState>
    </PageShell>
  )
}
