import { ArrowLeft, Award, Briefcase, CalendarDays, Target, Trophy } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { QualificationBadge } from '@/features/attempts'
import { useDoctorPublicProfile } from '@/features/doctors'
import { RankBadge } from '@/features/rankings'
import type { ApiError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { formatDate, getInitials } from '@/shared/lib/format'
import { AsyncState } from '@/shared/ui/async-state'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { StatCard } from '@/shared/ui/stat-card'

export function DoctorProfilePage() {
  const { doctorId } = useParams()
  const id = Number(doctorId)

  const { data, isLoading, isError, error } = useDoctorPublicProfile(id)

  const passRate =
    data && data.completedAttempts > 0
      ? Math.round((data.passedAttempts / data.completedAttempts) * 100)
      : null

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to={ROUTES.ranking}>
          <ArrowLeft />
          Reytingga qaytish
        </Link>
      </Button>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
      >
        {data && (
          <div className="space-y-5">
            <Card>
              <CardContent className="flex flex-wrap items-start gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="text-base">
                    {getInitials(data.fullname)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight">
                      {data.fullname}
                    </h2>
                    {data.currentQualification && (
                      <QualificationBadge qualification={data.currentQualification} />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {data.specialty && (
                      <Badge variant="secondary">{data.specialty.name}</Badge>
                    )}
                    {data.workplace && (
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="size-3.5" />
                        {data.workplace}
                      </span>
                    )}
                    {data.experienceYears !== null && (
                      <span>{data.experienceYears} yil tajriba</span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatDate(data.joinedAt)} dan beri
                    </span>
                  </div>
                </div>

                {data.ranking.position !== null && (
                  <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                    <RankBadge position={data.ranking.position} />
                    <div className="text-sm">
                      <p className="font-medium">Reytingdagi o'rni</p>
                      <p className="text-muted-foreground">
                        {data.ranking.totalDoctors} ta shifokordan
                        {data.ranking.score !== null && (
                          <> · {data.ranking.score} ball</>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Target}
                label="Yakunlangan imtihonlar"
                value={data.completedAttempts}
                hint={
                  passRate === null ? undefined : `${passRate}% o'tgan`
                }
                tone="blue"
              />
              <StatCard
                icon={Trophy}
                label="Eng yuqori natija"
                value={data.bestScore === null ? '—' : `${data.bestScore}%`}
                tone="emerald"
              />
              <StatCard
                icon={Target}
                label="O'rtacha natija"
                value={
                  data.averageScore === null ? '—' : `${data.averageScore}%`
                }
                tone="violet"
              />
              <StatCard
                icon={Award}
                label="Amaldagi sertifikatlar"
                value={data.certificates.length}
                tone="amber"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sertifikatlar</CardTitle>
                <CardDescription>
                  Faqat amaldagi hujjatlar. Har birini raqami bo'yicha ochiq
                  tekshirish mumkin.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <AsyncState
                  isLoading={false}
                  isEmpty={data.certificates.length === 0}
                  emptyTitle="Sertifikat yo'q"
                  emptyDescription="Bu shifokorda hozircha amaldagi sertifikat yo'q."
                >
                  <ul className="divide-y divide-border">
                    {data.certificates.map((certificate) => (
                      <li
                        key={certificate.certificateId}
                        className="flex flex-wrap items-center gap-3 py-3"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-medium">{certificate.examTitle}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {certificate.certificateId} ·{' '}
                            {formatDate(certificate.issuedAt)} —{' '}
                            {formatDate(certificate.expiresAt)}
                          </p>
                        </div>

                        <QualificationBadge qualification={certificate.qualification} />
                        <span className="tabular-nums">
                          {certificate.score}%
                        </span>

                        <Button asChild variant="outline" size="sm">
                          <Link to={`/verify/${certificate.certificateId}`}>
                            Tekshirish
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </AsyncState>
              </CardContent>
            </Card>
          </div>
        )}
      </AsyncState>
    </div>
  )
}
