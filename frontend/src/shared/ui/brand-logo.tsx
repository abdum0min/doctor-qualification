import { APP } from '@/shared/config'
import { cn } from '@/shared/lib/utils'

/** Faqat belgi — yig'ilgan sidebar va kichik joylar uchun. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn('size-7', className)}>
      <rect width="32" height="32" rx="9" fill="var(--chart-1)" />
      <path
        d="M10 21.5V13a3 3 0 013-3h6a3 3 0 013 3v8.5"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M10 17h12" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

/** Belgi + nom. Nom `shared/config/app.ts` dan olinadi. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <BrandMark />
      <span className="text-base font-semibold tracking-tight">{APP.name}</span>
    </span>
  )
}
