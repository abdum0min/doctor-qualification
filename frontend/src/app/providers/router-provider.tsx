import type { PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'

export function RouterProvider({ children }: PropsWithChildren) {
  return <BrowserRouter>{children}</BrowserRouter>
}
