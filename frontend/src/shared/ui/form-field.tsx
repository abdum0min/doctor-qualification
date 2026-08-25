import type { ReactNode } from 'react'

import { Label } from './label'

interface FormFieldProps {
  id: string
  label: string
  /** react-hook-form'dan keladigan xato matni. Bo'lsa `hint` o'rniga ko'rsatiladi. */
  error?: string
  /** Maydonni to'ldirish bo'yicha izoh (xato yo'q paytda ko'rinadi). */
  hint?: string
  required?: boolean
  children: ReactNode
}

/** Label + maydon + xato/izoh — barcha formalarda bir xil vertikal ritm uchun. */
export function FormField({
  id,
  label,
  error,
  hint,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      {children}

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
