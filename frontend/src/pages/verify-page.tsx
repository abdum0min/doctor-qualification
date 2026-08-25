import { useState } from 'react'
import { CircleAlert, CircleCheck, CircleX, Clock, Search } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { QualificationBadge } from '@/features/attempts'
import {
  useVerifyCertificate,
  VERIFICATION_PRESENTATION,
  type PublicCertificate,
  type VerificationStatus,
} from '@/features/certificates'
import { buildRoute } from '@/shared/config'
import { formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Spinner } from '@/shared/ui/spinner'

const STATUS_ICONS = {
  VALID: CircleCheck,
  EXPIRED: Clock,
  REVOKED: CircleX,
  NOT_FOUND: CircleAlert,
} as const

const STATUS_MESSAGES: Record<VerificationStatus, string> = {
  VALID: "Sertifikat haqiqiy va amal qilish muddati o'tmagan.",
  EXPIRED: "Sertifikat haqiqiy, lekin amal qilish muddati tugagan.",
  REVOKED: 'Sertifikat platforma administratori tomonidan bekor qilingan.',
  NOT_FOUND: "Bunday Certificate ID topilmadi. Raqamni tekshirib qayta kiriting.",
}

const STATUS_TONES: Record<VerificationStatus, string> = {
  VALID: 'text-success',
  EXPIRED: 'text-warning',
  REVOKED: 'text-destructive',
  NOT_FOUND: 'text-muted-foreground',
}

export function VerifyPage() {
  const { certificateId = '' } = useParams()
  const { data, isLoading, isError } = useVerifyCertificate(certificateId)

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sertifikatni tekshirish
        </h1>
        <p className="text-sm text-muted-foreground">
          Certificate ID yoki QR kod orqali shifokor sertifikatining haqiqiyligini
          tasdiqlang.
        </p>
      </div>

      {/* `key` — manzildagi ID o'zgarganda maydon avtomatik yangilanadi. */}
      <SearchForm key={certificateId} initialValue={certificateId} />

      {certificateId && isLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      )}

      {certificateId && !isLoading && (
        <VerificationResult
          status={isError ? 'NOT_FOUND' : (data?.status ?? 'NOT_FOUND')}
          certificate={isError ? null : (data?.certificate ?? null)}
        />
      )}
    </div>
  )
}

function SearchForm({ initialValue }: { initialValue: string }) {
  const navigate = useNavigate()
  const [input, setInput] = useState(initialValue)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()

    if (trimmed) {
      navigate(buildRoute.verify(trimmed))
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="DOC-2026-000123"
              aria-label="Certificate ID"
              className="pl-8 font-mono"
            />
          </div>
          <Button type="submit" disabled={!input.trim()}>
            Tekshirish
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function VerificationResult({
  status,
  certificate,
}: {
  status: VerificationStatus
  certificate: PublicCertificate | null
}) {
  const Icon = STATUS_ICONS[status]
  const presentation = VERIFICATION_PRESENTATION[status]

  return (
    <Card>
      <CardHeader className="items-center gap-2 text-center">
        <Icon className={cn('size-12', STATUS_TONES[status])} />
        <CardTitle className="text-lg">{presentation.label}</CardTitle>
        <CardDescription>{STATUS_MESSAGES[status]}</CardDescription>
      </CardHeader>

      {certificate && (
        <CardContent>
          <dl className="divide-y divide-border">
            <Row label="Certificate ID">
              <span className="font-mono font-medium">{certificate.certificateId}</span>
            </Row>
            <Row label="Shifokor">{certificate.doctorFullname}</Row>
            <Row label="Mutaxassislik">{certificate.specialtyName}</Row>
            <Row label="Imtihon">{certificate.examTitle}</Row>
            <Row label="Natija">
              <span className="tabular-nums">{certificate.score}%</span>
            </Row>
            <Row label="Malaka darajasi">
              <QualificationBadge qualification={certificate.qualification} />
            </Row>
            <Row label="Berilgan sana">{formatDate(certificate.issuedAt)}</Row>
            <Row label="Amal qilish muddati">{formatDate(certificate.expiresAt)}</Row>
            {certificate.revokedAt && (
              <Row label="Bekor qilingan sana">
                <Badge variant="destructive">{formatDate(certificate.revokedAt)}</Badge>
              </Row>
            )}
          </dl>
        </CardContent>
      )}
    </Card>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  )
}
