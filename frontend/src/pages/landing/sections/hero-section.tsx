import { useState } from 'react'
import { BookOpen, CircleCheck, QrCode, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useCurrentUser } from '@/features/auth'
import { buildRoute, roleHome, ROUTES } from '@/shared/config'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

export function HeroSection() {
  const user = useCurrentUser()

  return (
    <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
        <div className="space-y-6">
          <Badge variant="info" className="h-auto gap-1.5 px-3 py-1">
            <ShieldCheck className="size-3.5" />
            Raqamli baholash — rasmiy tasdiqlash
          </Badge>

          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            Shifokorlar bilim va malakasini baholash{' '}
            <span className="text-primary">platformasi</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Onlayn testlar orqali bilimingizni sinang, malaka darajangizni aniqlang
            va natijangizni tasdiqlovchi elektron sertifikatga ega bo'ling.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to={user ? roleHome(user.role) : ROUTES.register}>
                <BookOpen />
                Imtihonga kirish
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how-it-works">Qanday ishlaydi?</a>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            {['Server tomonida baholash', 'QR orqali tekshirish', '10+ yo`nalish'].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CircleCheck className="size-4 text-success" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="space-y-4">
          <CertificatePreview />
          <VerifyWidget />
        </div>
      </div>
    </section>
  )
}

function CertificatePreview() {
  return (
    <Card className="overflow-hidden border-2 border-primary/20 shadow-sm">
      <CardContent className="space-y-5 bg-card p-6 text-center">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-primary">
            DOCTOR QUALIFICATION
          </p>
          <p className="text-2xl font-semibold tracking-tight">SERTIFIKAT</p>
          <p className="text-xs text-muted-foreground">
            Malaka darajasini tasdiqlovchi elektron hujjat
          </p>
        </div>

        <div className="space-y-1 border-y border-border py-4">
          <p className="text-lg font-semibold">Abdullayev Anvar Anvarovich</p>
          <p className="text-sm text-muted-foreground">Kardiolog</p>
        </div>

        <dl className="grid grid-cols-3 gap-3 text-left">
          {[
            { label: 'Natija', value: '91%' },
            { label: 'Daraja', value: 'Yuqori' },
            { label: 'Amal qiladi', value: '1 yil' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-muted/60 p-2.5 text-center">
              <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
                {item.label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-left">
          <div className="min-w-0">
            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
              Certificate ID
            </p>
            <p className="truncate font-mono text-sm font-medium">DOC-2026-000123</p>
          </div>
          <QrCode className="size-9 shrink-0 text-muted-foreground" />
        </div>

        <p className="text-[10px] text-muted-foreground">
          Namuna — haqiqiy sertifikat imtihondan so'ng beriladi
        </p>
      </CardContent>
    </Card>
  )
}

function VerifyWidget() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Sertifikatni tekshirish</p>
          <p className="text-xs text-muted-foreground">
            Certificate ID orqali haqiqiyligini tasdiqlang
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            const trimmed = value.trim()

            if (trimmed) {
              navigate(buildRoute.verify(trimmed))
            }
          }}
          className="flex gap-2"
        >
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="DOC-2026-000123"
            aria-label="Certificate ID"
            className="font-mono"
          />
          <Button type="submit" disabled={!value.trim()}>
            Tekshirish
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
