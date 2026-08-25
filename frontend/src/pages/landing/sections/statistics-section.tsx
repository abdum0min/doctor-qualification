import { Award, ClipboardCheck, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { usePublicStatistics } from '@/features/statistics'
import { useActiveSpecialties } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { StatCard } from '@/shared/ui/stat-card'

const DASH = '—'

export function StatisticsSection() {
  const { data, isLoading, isError, error } = usePublicStatistics()

  return (
    <section id="statistics" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platforma statistikasi</CardTitle>
          </CardHeader>

          <CardContent>
            <AsyncState
              isLoading={isLoading}
              isError={isError}
              errorMessage={(error as ApiError | null)?.message}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={Users}
                  tone="blue"
                  label="Jami shifokorlar"
                  value={data?.totalDoctors ?? 0}
                  hint="Platformada ro'yxatdan o'tgan"
                />
                <StatCard
                  icon={ClipboardCheck}
                  tone="emerald"
                  label="Imtihon topshirganlar"
                  value={data?.completedAttempts ?? 0}
                  hint="Yakunlangan urinishlar"
                />
                <StatCard
                  icon={Award}
                  tone="violet"
                  label="Sertifikat olganlar"
                  value={data?.certificatesIssued ?? 0}
                  hint="Amaldagi sertifikatlar"
                />
                <StatCard
                  icon={TrendingUp}
                  tone="amber"
                  label="O'rtacha natija"
                  value={
                    data?.averageScore === null || data?.averageScore === undefined
                      ? DASH
                      : `${data.averageScore}%`
                  }
                  hint="Barcha imtihonlar bo'yicha"
                />
              </div>
            </AsyncState>
          </CardContent>
        </Card>

        <PopularSpecialties
          specialties={data?.topSpecialties ?? []}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}

function PopularSpecialties({
  specialties,
  isLoading,
}: {
  specialties: { name: string; doctorsCount: number }[]
  isLoading: boolean
}) {
  const { data: allSpecialties } = useActiveSpecialties()

  // Hech kim yo'nalish tanlamagan bo'lsa ham ro'yxat bo'sh ko'rinmasin.
  const rows = specialties.length
    ? specialties
    : (allSpecialties ?? []).slice(0, 5).map((specialty) => ({
        name: specialty.name,
        doctorsCount: 0,
      }))

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Ommabop mutaxassisliklar</CardTitle>
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <a href="#specialties">Barchasini ko'rish</a>
        </Button>
      </CardHeader>

      <CardContent>
        <AsyncState isLoading={isLoading} isEmpty={rows.length === 0}>
          <ul className="divide-y divide-border">
            {rows.map((specialty) => (
              <li
                key={specialty.name}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <span className="truncate font-medium">{specialty.name}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {specialty.doctorsCount} nafar
                </span>
              </li>
            ))}
          </ul>
        </AsyncState>

        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <Link to={ROUTES.register}>Ro'yxatdan o'tish</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
