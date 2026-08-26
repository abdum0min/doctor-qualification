import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  /** O'ng tomondagi asosiy amal (masalan "Imtihonga kirish"). */
  action?: ReactNode
}

/** Barcha sahifalarda bir xil sarlavha bloki. */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
