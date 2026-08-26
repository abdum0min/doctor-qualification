import { useState } from 'react'
import { CheckCheck } from 'lucide-react'

import {
  NotificationItem,
  useMarkAllNotificationsRead,
  useNotifications,
} from '@/features/notifications'
import type { ApiError } from '@/shared/api'
import { AsyncState } from '@/shared/ui/async-state'
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

  const { data, isLoading, isError, error } = useNotifications({
    page,
    limit: PAGE_SIZE,
    ...(unreadOnly ? { unreadOnly: true } : {}),
  })
  const markAllRead = useMarkAllNotificationsRead()

  const items = data?.items ?? []
  const hasUnread = items.some((notification) => !notification.readAt)


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
            <li key={notification.id} className="py-1">
              <NotificationItem notification={notification} />
            </li>
          ))}
        </ul>

        {data && <TablePagination meta={data.meta} onPageChange={setPage} />}
      </AsyncState>
    </PageShell>
  )
}
