import { Link } from 'react-router-dom'

import { buildRoute, ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTopDoctors } from '../api/rankings-queries'
import { RankBadge } from './rank-badge'

interface TopDoctorsProps {
  /** Berilsa — faqat shu yo'nalish bo'yicha reyting ko'rsatiladi. */
  specialtyId?: number
  title?: string
}

export function TopDoctors({
  specialtyId,
  title = 'TOP shifokorlar',
}: TopDoctorsProps) {
  const { data, isLoading } = useTopDoctors(
    specialtyId ? { specialtyId } : {},
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardAction>
          <Button asChild variant="link" size="sm" className="h-auto p-0">
            <Link to={ROUTES.ranking}>Barchasini ko'rish</Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-1">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : data?.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Reyting hali shakllanmagan
          </p>
        ) : (
          data?.map((row) => (
            <Link
              key={row.doctorId}
              to={buildRoute.doctor(row.doctorId)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
            >
              <RankBadge position={row.position} />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{row.fullname}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {row.specialtyName ?? 'Mutaxassislik tanlanmagan'}
                </span>
              </span>

              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {row.score}
              </span>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}
