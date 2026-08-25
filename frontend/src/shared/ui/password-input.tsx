import { forwardRef, useState, type ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Input } from './input'

/** Ko'rish/yashirish tugmasi bilan parol maydoni. `register()` bilan to'g'ridan-to'g'ri ishlaydi. */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<ComponentProps<typeof Input>, 'type'>
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={cn('pr-9', className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Parolni yashirish' : 'Parolni ko`rsatish'}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'
