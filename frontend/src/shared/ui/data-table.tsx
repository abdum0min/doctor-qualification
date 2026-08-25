import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Skeleton } from './skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string | number
  isLoading?: boolean
  emptyText?: string
  skeletonRows?: number
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading,
  emptyText = "Ma'lumot topilmadi",
  skeletonRows = 5,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && data.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="py-12">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Inbox className="size-8" />
                  <p className="text-sm">{emptyText}</p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            data.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={cn(column.className)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
