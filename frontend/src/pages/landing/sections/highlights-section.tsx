import { BarChart3, Clock, ShieldCheck, Users } from 'lucide-react'

const HIGHLIGHTS = [
  {
    icon: Users,
    title: 'Barcha mutaxassisliklar',
    description: '10+ tibbiy yo`nalish',
  },
  {
    icon: ShieldCheck,
    title: 'Rasmiy sertifikat',
    description: 'QR kod bilan tasdiqlanadi',
  },
  {
    icon: BarChart3,
    title: 'Daraja tizimi',
    description: '5 bosqichli baholash tizimi',
  },
  {
    icon: Clock,
    title: 'Onlayn imtihon',
    description: '24/7 istalgan vaqtda',
  },
]

export function HighlightsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
