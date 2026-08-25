import { cn } from '@/shared/lib/utils'
import { Demo, Section } from '../ui/section'

/** Semantik ranglar — komponentlarda faqat shu nomlar ishlatiladi, xom hex emas. */
const SEMANTIC_COLORS = [
  { name: 'background', className: 'bg-background border' },
  { name: 'foreground', className: 'bg-foreground' },
  { name: 'card', className: 'bg-card border' },
  { name: 'muted', className: 'bg-muted' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'secondary', className: 'bg-secondary' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'destructive', className: 'bg-destructive' },
  { name: 'success', className: 'bg-success' },
  { name: 'warning', className: 'bg-warning' },
  { name: 'info', className: 'bg-info' },
  { name: 'border', className: 'bg-border' },
]

// Tailwind klass nomlarini statik yozamiz — shablon qatorlarni JIT ko'rmaydi.
const CHART_COLORS = [
  { name: 'chart-1', className: 'bg-chart-1' },
  { name: 'chart-2', className: 'bg-chart-2' },
  { name: 'chart-3', className: 'bg-chart-3' },
  { name: 'chart-4', className: 'bg-chart-4' },
  { name: 'chart-5', className: 'bg-chart-5' },
]

const SIDEBAR_COLORS = [
  { name: 'sidebar', className: 'bg-sidebar' },
  { name: 'sidebar-accent', className: 'bg-sidebar-accent' },
  { name: 'sidebar-primary', className: 'bg-sidebar-primary' },
  { name: 'sidebar-border', className: 'bg-sidebar-border' },
]

const TYPOGRAPHY = [
  { label: 'text-3xl / semibold', className: 'text-3xl font-semibold tracking-tight' },
  { label: 'text-xl / semibold', className: 'text-xl font-semibold tracking-tight' },
  { label: 'text-base / medium', className: 'text-base font-medium' },
  { label: 'text-sm / normal', className: 'text-sm' },
  { label: 'text-sm / muted', className: 'text-sm text-muted-foreground' },
  { label: 'text-xs / muted', className: 'text-xs text-muted-foreground' },
]

const RADII = [
  { name: 'sm', className: 'rounded-sm' },
  { name: 'md', className: 'rounded-md' },
  { name: 'lg', className: 'rounded-lg' },
  { name: 'xl', className: 'rounded-xl' },
  { name: '2xl', className: 'rounded-2xl' },
  { name: 'full', className: 'rounded-full' },
]

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="space-y-1.5">
      <div className={cn('h-12 w-full rounded-lg', className)} />
      <p className="font-mono text-[11px] text-muted-foreground">{name}</p>
    </div>
  )
}

export function FoundationsSection() {
  return (
    <Section
      id="foundations"
      title="Foundations"
      description="Ranglar, shrift o'lchamlari va radiuslar. Hammasi `src/index.css` dagi CSS o'zgaruvchilardan keladi — mavzuni o'zgartirish uchun faqat o'sha faylni tahrirlang."
    >
      <Demo
        title="Semantik ranglar"
        description="Komponentlarda `bg-primary` kabi nomlar ishlatiladi — light/dark rejim avtomatik ishlaydi."
        layout="stack"
        wide
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {SEMANTIC_COLORS.map((color) => (
            <Swatch key={color.name} {...color} />
          ))}
        </div>
      </Demo>

      <Demo title="Chart palitrasi" description="Grafiklar uchun 5 ta rang." layout="stack">
        <div className="grid grid-cols-5 gap-3">
          {CHART_COLORS.map((color) => (
            <Swatch key={color.name} {...color} />
          ))}
        </div>
      </Demo>

      <Demo
        title="Sidebar palitrasi"
        description="Sidebar ikkala rejimda ham to'q qoladi — brend elementi."
        layout="stack"
      >
        <div className="grid grid-cols-4 gap-3">
          {SIDEBAR_COLORS.map((color) => (
            <Swatch key={color.name} {...color} />
          ))}
        </div>
      </Demo>

      <Demo title="Tipografika" description="Geist Variable — barcha matnlar uchun." layout="stack">
        {TYPOGRAPHY.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-4">
            <span className={item.className}>Matn namunasi</span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </Demo>

      <Demo title="Radiuslar" description="`--radius` o'zgaruvchisidan hisoblanadi.">
        {RADII.map((radius) => (
          <div key={radius.name} className="space-y-1.5 text-center">
            <div className={cn('size-14 border-2 border-primary bg-primary/10', radius.className)} />
            <p className="font-mono text-[11px] text-muted-foreground">{radius.name}</p>
          </div>
        ))}
      </Demo>
    </Section>
  )
}
