import type { PropsWithChildren } from 'react'

import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { QueryProvider } from './query-provider'
import { RouterProvider } from './router-provider'
import { ThemeProvider } from './theme-provider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <TooltipProvider delayDuration={200}>
          <RouterProvider>{children}</RouterProvider>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
