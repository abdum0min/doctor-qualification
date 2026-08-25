import { CertificateCard, useCertificates } from '@/features/certificates'
import type { ApiError } from '@/shared/api'
import { useTableQuery } from '@/shared/hooks'
import { AsyncState } from '@/shared/ui/async-state'
import { TablePagination } from '@/shared/ui/table-pagination'

export function CertificatesPage() {
  const table = useTableQuery(10)
  const { data, isLoading, isError, error } = useCertificates(table.params)

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Sertifikatlar</h2>
        <p className="text-sm text-muted-foreground">
          Imtihondan muvaffaqiyatli o'tganingizda sertifikat avtomatik beriladi.
        </p>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
        isEmpty={data?.items.length === 0}
        emptyTitle="Sertifikat yo'q"
        emptyDescription="O'tish balidan yuqori natija oling — sertifikat shu yerda paydo bo'ladi."
      >
        <div className="space-y-4">
          {data?.items.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      </AsyncState>

      {data && (
        <TablePagination
          meta={data.meta}
          onNext={table.goNext}
          onPrev={table.goBack}
          canGoBack={table.canGoBack}
        />
      )}
    </div>
  )
}
