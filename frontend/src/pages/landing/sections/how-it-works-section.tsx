import {
  Award,
  ClipboardCheck,
  FileText,
  Stethoscope,
  UserPlus,
} from 'lucide-react'

const STEPS = [
  {
    icon: UserPlus,
    title: "Ro'yxatdan o'tish",
    description: "Hisob yarating va profilingizni to'ldiring",
  },
  {
    icon: Stethoscope,
    title: 'Mutaxassislik tanlash',
    description: "O'zingizning yo'nalishingizni tanlang",
  },
  {
    icon: FileText,
    title: 'Test topshirish',
    description: 'Savollarga javob bering va testni yakunlang',
  },
  {
    icon: ClipboardCheck,
    title: 'Natijani olish',
    description: "Natijangizni ko'ring va darajangizni aniqlang",
  },
  {
    icon: Award,
    title: 'Sertifikat olish',
    description: 'Elektron sertifikatni yuklab oling',
  },
]

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-y border-border bg-muted/30 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Qanday ishlaydi?</h2>
          <p className="text-sm text-muted-foreground">
            Ro'yxatdan o'tishdan sertifikatgacha — besh bosqich
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-xl border border-border bg-card p-4"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="size-4.5" />
              </span>

              <p className="mt-3 text-sm font-medium">
                <span className="text-muted-foreground tabular-nums">
                  {index + 1}.{' '}
                </span>
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
