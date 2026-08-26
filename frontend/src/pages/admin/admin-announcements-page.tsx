import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, Users } from 'lucide-react'

import { QUALIFICATION_LABELS, QUALIFICATION_LEVELS } from '@/features/attempts'
import {
  announcementSchema,
  useAnnouncements,
  useAudiencePreview,
  useSendAnnouncement,
  type Announcement,
  type AnnouncementFormValues,
  type AudienceFilter,
} from '@/features/notifications'
import { SpecialtySelect } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { useTableQuery } from '@/shared/hooks'
import { formatDateTime } from '@/shared/lib/format'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { DataTable, type Column } from '@/shared/ui/data-table'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Spinner } from '@/shared/ui/spinner'
import { TablePagination } from '@/shared/ui/table-pagination'
import { Textarea } from '@/shared/ui/textarea'

const ANY = 'any'

const columns: Column<Announcement>[] = [
  {
    key: 'title',
    header: 'Sarlavha',
    cell: (row) => (
      <div className="min-w-0 space-y-0.5">
        <p className="font-medium">{row.title}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{row.body}</p>
      </div>
    ),
  },
  {
    key: 'audience',
    header: 'Kimga',
    cell: (row) => <Badge variant="secondary">{row.audience}</Badge>,
  },
  {
    key: 'recipientCount',
    header: 'Qabul qiluvchilar',
    className: 'text-right tabular-nums',
    cell: (row) => row.recipientCount,
  },
  {
    key: 'sentBy',
    header: 'Yuborgan',
    cell: (row) => (
      <span className="text-muted-foreground">{row.sentBy ?? '—'}</span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Sana',
    className: 'whitespace-nowrap',
    cell: (row) => formatDateTime(row.createdAt),
  },
]

export function AdminAnnouncementsPage() {
  const [filter, setFilter] = useState<AudienceFilter>({})
  const table = useTableQuery()

  const { data: audience, isLoading: audienceLoading } =
    useAudiencePreview(filter)
  const { data, isLoading, isError, error } = useAnnouncements(table.params)
  const sendAnnouncement = useSendAnnouncement()

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: '', body: '', link: '' },
  })

  const recipientCount = audience?.recipientCount ?? 0

  function onSubmit(values: AnnouncementFormValues) {
    sendAnnouncement.mutate(
      {
        ...filter,
        title: values.title,
        body: values.body,
        link: values.link || null,
      },
      { onSuccess: () => form.reset({ title: '', body: '', link: '' }) },
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">E'lonlar</h2>
        <p className="text-sm text-muted-foreground">
          Shifokorlarga ommaviy xabar yuboring — har biri o'z bildirishnomalarida
          ko'radi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yangi xabar</CardTitle>
          <CardDescription>
            Filtrlarni bo'sh qoldirsangiz xabar barcha faol shifokorlarga ketadi.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 lg:grid-cols-2"
          >
            <div className="space-y-4">
              <FormField
                id="announcement-title"
                label="Sarlavha"
                required
                error={form.formState.errors.title?.message}
              >
                <Input
                  id="announcement-title"
                  placeholder="Attestatsiya davri boshlandi"
                  {...form.register('title')}
                />
              </FormField>

              <FormField
                id="announcement-body"
                label="Matn"
                required
                error={form.formState.errors.body?.message}
              >
                <Textarea
                  id="announcement-body"
                  rows={4}
                  placeholder="Xabar matnini yozing..."
                  {...form.register('body')}
                />
              </FormField>

              <FormField
                id="announcement-link"
                label="Havola"
                hint="Ixtiyoriy. Ilova ichidagi manzil, masalan /exams"
                error={form.formState.errors.link?.message}
              >
                <Input
                  id="announcement-link"
                  placeholder="/exams"
                  {...form.register('link')}
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <FormField
                id="announcement-specialty"
                label="Mutaxassislik"
                hint="Tanlanmasa — barcha yo'nalishlar"
              >
                <SpecialtySelect
                  id="announcement-specialty"
                  clearable
                  clearLabel="Barcha mutaxassisliklar"
                  value={filter.specialtyId ?? null}
                  onChange={(specialtyId) =>
                    setFilter((current) => ({
                      ...current,
                      specialtyId: specialtyId ?? undefined,
                    }))
                  }
                  placeholder="Barcha mutaxassisliklar"
                />
              </FormField>

              <FormField
                id="announcement-qualification"
                label="Malaka darajasi"
                hint="Shu darajaga erishgan shifokorlar"
              >
                <Select
                  value={filter.qualification ?? ANY}
                  onValueChange={(value) =>
                    setFilter((current) => ({
                      ...current,
                      qualification:
                        value === ANY
                          ? undefined
                          : (value as AudienceFilter['qualification']),
                    }))
                  }
                >
                  <SelectTrigger
                    id="announcement-qualification"
                    className="w-full"
                  >
                    <SelectValue placeholder="Barcha darajalar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Barcha darajalar</SelectItem>
                    {QUALIFICATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {QUALIFICATION_LABELS[level]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm">
                <Users className="size-4 shrink-0 text-muted-foreground" />
                {audienceLoading ? (
                  <Spinner className="size-4" />
                ) : (
                  <span>
                    <span className="font-semibold tabular-nums">
                      {recipientCount}
                    </span>{' '}
                    ta shifokor xabarni oladi
                    <span className="text-muted-foreground">
                      {' '}
                      · {audience?.audience}
                    </span>
                  </span>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={sendAnnouncement.isPending || recipientCount === 0}
              >
                {sendAnnouncement.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <Send className="size-4" />
                )}
                Xabarni yuborish
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yuborilgan xabarlar</CardTitle>
          <CardDescription>
            Auditoriya va qabul qiluvchilar soni yuborilgan paytdagi holatda
            saqlanadi.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <AsyncState
            isLoading={isLoading}
            isError={isError}
            errorMessage={(error as ApiError | null)?.message}
          >
            <DataTable
              data={data?.items ?? []}
              columns={columns}
              rowKey={(row) => row.id}
              emptyText="Hali xabar yuborilmagan"
            />

            {data && (
              <TablePagination meta={data.meta} onPageChange={table.setPage} />
            )}
          </AsyncState>
        </CardContent>
      </Card>
    </div>
  )
}
