import { Download, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { QualificationBadge } from '@/features/attempts'
import { buildRoute } from '@/shared/config'
import { formatDate } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Spinner } from '@/shared/ui/spinner'
import { useDownloadCertificate } from '../api/certificates-queries'
import { certificateState } from '../model/status'
import type { Certificate } from '../model/types'

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const download = useDownloadCertificate()
  const state = certificateState(certificate)

  const facts = [
    { label: 'Mutaxassislik', value: certificate.specialtyName },
    { label: 'Natija', value: `${certificate.score}%` },
    { label: 'Berilgan', value: formatDate(certificate.issuedAt) },
    { label: 'Amal qiladi', value: formatDate(certificate.expiresAt) },
  ]

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="font-mono text-sm font-semibold">
              {certificate.certificateId}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {certificate.examTitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <QualificationBadge qualification={certificate.qualification} />
            <Badge variant={state.variant}>{state.label}</Badge>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="text-sm font-medium tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {certificate.revokedReason && (
          <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            Bekor qilish sababi: {certificate.revokedReason}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={download.isPending}
            onClick={() => download.mutate(certificate.certificateId)}
          >
            {download.isPending ? <Spinner /> : <Download />}
            PDF yuklab olish
          </Button>

          <Button asChild size="sm" variant="outline">
            <Link
              to={buildRoute.verify(certificate.certificateId)}
              target="_blank"
              rel="noreferrer"
            >
              <ShieldCheck />
              Tekshirish sahifasi
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
