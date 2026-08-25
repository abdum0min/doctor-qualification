import { useEffect, useState } from 'react'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { ButtonsSection } from './sections/buttons-section'
import { DataSection } from './sections/data-section'
import { FormsSection } from './sections/forms-section'
import { FoundationsSection } from './sections/foundations-section'
import { NavigationSection } from './sections/navigation-section'
import { OverlaysSection } from './sections/overlays-section'
import { PatternsSection } from './sections/patterns-section'

const NAV = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'buttons', label: 'Tugmalar' },
  { id: 'forms', label: 'Formalar' },
  { id: 'data', label: "Ma'lumot" },
  { id: 'overlays', label: 'Oynalar' },
  { id: 'navigation', label: 'Navigatsiya' },
  { id: 'patterns', label: 'Qoliplar' },
]

/** Scroll paytida qaysi bo'lim ko'rinayotganini kuzatadi. */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]

        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )

    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [ids])

  return active
}

const SECTION_IDS = NAV.map((item) => item.id)

export function DesignSystemPage() {
  const active = useActiveSection(SECTION_IDS)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">Design System</h2>
            <Badge variant="secondary">shadcn/ui</Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Loyihadagi barcha umumiy komponentlar shu yerda jonli holatda ko'rsatilgan.
            Yangi ekran yasashdan oldin shu sahifadan kerakli blokni topib, kodini{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              src/pages/design-system/sections/
            </code>{' '}
            dan nusxa oling.
          </p>
        </div>

        <ThemeToggle />
      </div>

      {/* Bo'limlar bo'ylab tez o'tish — sticky nav */}
      <nav className="sticky top-14 z-10 -mx-1 flex gap-1 overflow-x-auto rounded-lg border border-border bg-card/85 p-1 backdrop-blur">
        {NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              active === item.id && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            )}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="space-y-10">
        <FoundationsSection />
        <ButtonsSection />
        <FormsSection />
        <DataSection />
        <OverlaysSection />
        <NavigationSection />
        <PatternsSection />
      </div>
    </div>
  )
}
