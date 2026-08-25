import type { ReactNode } from 'react'
import { Inbox, TriangleAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from './alert'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty'
import { Spinner } from './spinner'

interface AsyncStateProps {
  isLoading: boolean
  isError?: boolean
  errorMessage?: string
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  /** Skeleton ko'rsatish kerak bo'lsa — standart spinner o'rniga. */
  loadingFallback?: ReactNode
  children: ReactNode
}

/**
 * Har bir async blok uchun bir xil loading / error / empty ko'rinishi.
 * Sahifalarda `if (isLoading) ...` zanjirlari takrorlanmasligi uchun.
 */
export function AsyncState({
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  emptyTitle = "Ma'lumot yo'q",
  emptyDescription,
  loadingFallback,
  children,
}: AsyncStateProps) {
  if (isLoading) {
    return (
      loadingFallback ?? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      )
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <TriangleAlert />
        <AlertTitle>Xatolik yuz berdi</AlertTitle>
        <AlertDescription>
          {errorMessage ?? "Ma'lumotni yuklab bo'lmadi. Keyinroq qayta urinib ko'ring."}
        </AlertDescription>
      </Alert>
    )
  }

  if (isEmpty) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          {emptyDescription && <EmptyDescription>{emptyDescription}</EmptyDescription>}
        </EmptyHeader>
      </Empty>
    )
  }

  return <>{children}</>
}
