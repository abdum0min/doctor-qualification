import { QrCode, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { QUALIFICATION_LABELS } from '@/features/attempts'
import { buildRoute } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

/** Chegaralar backend'dagi `QUALIFICATION_BANDS` bilan bir xil. */
const BANDS = [
  { range: '0–49%', level: 'BEGINNER' },
  { range: '50–69%', level: 'INTERMEDIATE' },
  { range: '70–84%', level: 'GOOD' },
  { range: '85–94%', level: 'HIGH' },
  { range: '95–100%', level: 'EXPERT' },
] as const

const CERTIFICATE_FACTS = [
  'Shifokorning F.I.Sh. va mutaxassisligi',
  'Test natijasi va malaka darajasi',
  'Noyob Certificate ID va QR kod',
  'Berilgan sana va amal qilish muddati',
]

export function QualificationSection() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Malaka darajalari</CardTitle>
            <CardDescription>
              Natijangiz avtomatik ravishda darajaga aylantiriladi
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ul className="divide-y divide-border">
              {BANDS.map((band) => (
                <li
                  key={band.level}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="font-medium tabular-nums">{band.range}</span>
                  <span className="text-muted-foreground">
                    {QUALIFICATION_LABELS[band.level]}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Elektron sertifikat</CardTitle>
            <CardDescription>
              O'tish balidan yuqori natija olganingizda avtomatik beriladi
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <ul className="space-y-2">
              {CERTIFICATE_FACTS.map((fact) => (
                <li key={fact} className="flex items-start gap-2 text-sm">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">{fact}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
              <QrCode className="size-8 shrink-0 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium">QR orqali tekshirish</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Ish beruvchi sertifikatdagi QR kodni skanerlab yoki Certificate ID
                  ni kiritib haqiqiyligini tasdiqlashi mumkin — bunda tizimga kirish
                  talab qilinmaydi.
                </p>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link to={buildRoute.verify('DOC-2026-000123')}>
                Tekshirish sahifasini ochish
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
