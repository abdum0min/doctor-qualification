import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

interface SectionProps {
  id: string
  title: string
  description?: string
  children: ReactNode
}

/** Design system sahifasidagi bitta katta bo'lim. */
export function Section({ id, title, description, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  )
}

interface DemoProps {
  title: string
  description?: string
  /** Kartani ikkala ustunga yoyadi. */
  wide?: boolean
  /** `row` — yonma-yon (default), `stack` — ustma-ust. */
  layout?: 'row' | 'stack'
  className?: string
  children: ReactNode
}

/** Bitta komponentni ko'rsatuvchi namuna kartasi. */
export function Demo({
  title,
  description,
  wide,
  layout = 'row',
  className,
  children,
}: DemoProps) {
  return (
    <Card className={cn(wide && 'lg:col-span-2', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent
        className={cn(
          layout === 'row' ? 'flex flex-wrap items-center gap-3' : 'space-y-4',
        )}
      >
        {children}
      </CardContent>
    </Card>
  )
}
