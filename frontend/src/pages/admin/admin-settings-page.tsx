import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { Info, RotateCcw, Save } from 'lucide-react'

import {
  FACTORY_SETTINGS,
  settingsSchema,
  toSettingsPayload,
  toSettingsValues,
  useSettings,
  useUpdateSettings,
  weightSum,
  type SettingsValues,
} from '@/features/settings'
import type { ApiError } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import { Spinner } from '@/shared/ui/spinner'

export function AdminSettingsPage() {
  const { data, isLoading, isError, error } = useSettings()
  const update = useUpdateSettings()

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: FACTORY_SETTINGS,
  })

  const { reset } = form

  useEffect(() => {
    if (data) {
      reset(toSettingsValues(data))
    }
  }, [data, reset])

  // `useWatch` — `watch()` dan farqli, memoizatsiya qilinadigan API.
  const total = weightSum(useWatch({ control: form.control }))

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Sozlamalar</h2>
        <p className="text-sm text-muted-foreground">
          Reyting formulasi, sertifikat muddati va yangi imtihon uchun standart
          qiymatlar
          {data && (
            <>
              {' · '}
              <span>oxirgi o'zgarish: {formatDateTime(data.updatedAt)}</span>
            </>
          )}
        </p>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
      >
        <form
          onSubmit={form.handleSubmit((values) =>
            update.mutate(toSettingsPayload(values)),
          )}
          className="space-y-5"
        >
          <Card>
            <CardHeader>
              <CardTitle>Reyting formulasi</CardTitle>
              <CardDescription>
                Har bir ko'rsatkich 0–100 shkalasida. Vaznlar yig'indisi 1 ga
                teng bo'lishi shart emas — ball baribir 0–100 oralig'ida
                qoladi.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <NumberField
                  form={form}
                  name="averageScoreWeight"
                  label="O'rtacha natija"
                  step="0.05"
                />
                <NumberField
                  form={form}
                  name="bestScoreWeight"
                  label="Eng yuqori natija"
                  step="0.05"
                />
                <NumberField
                  form={form}
                  name="volumeWeight"
                  label="Urinishlar hajmi"
                  step="0.05"
                />
                <NumberField
                  form={form}
                  name="passRateWeight"
                  label="O'tish ulushi"
                  step="0.05"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  form={form}
                  name="volumeTargetAttempts"
                  label="To'liq hajm uchun urinishlar"
                  hint="Shuncha urinishdan keyin hajm ko'rsatkichi 100 ballga yetadi"
                />

                <div className="flex items-end">
                  <p className="text-sm text-muted-foreground">
                    Vaznlar yig'indisi:{' '}
                    <span className="font-semibold tabular-nums text-foreground">
                      {total.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sertifikat</CardTitle>
              <CardDescription>
                O'zgartirish faqat yangi beriladigan hujjatlarga ta'sir qiladi.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="max-w-xs">
                <NumberField
                  form={form}
                  name="certificateValidityMonths"
                  label="Amal qilish muddati (oy)"
                />
              </div>

              <Alert>
                <Info />
                <AlertTitle>Bu yerda o'zgartirilmaydi</AlertTitle>
                <AlertDescription>
                  Malaka darajasi chegaralari va sertifikat raqami formati
                  (DOC-YYYY-NNNNNN) berilgan hujjatlarga yozilgan, shuning
                  uchun sozlamaga chiqarilmagan.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yangi imtihon standartlari</CardTitle>
              <CardDescription>
                Imtihon yaratish formasi shu qiymatlar bilan to'ldiriladi.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-3">
              <NumberField
                form={form}
                name="defaultQuestionCount"
                label="Savollar soni"
              />
              <NumberField
                form={form}
                name="defaultTimeLimitMinutes"
                label="Vaqt (daqiqa)"
              />
              <NumberField
                form={form}
                name="defaultPassingScore"
                label="O'tish bali (%)"
              />
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={() => reset(FACTORY_SETTINGS)}
            >
              <RotateCcw className="size-4" />
              Standart qiymatlar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => data && reset(toSettingsValues(data))}
              disabled={!form.formState.isDirty}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              className="gap-2"
              disabled={update.isPending || !form.formState.isDirty}
            >
              {update.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <Save className="size-4" />
              )}
              Saqlash
            </Button>
          </div>
        </form>
      </AsyncState>
    </div>
  )
}

function NumberField({
  form,
  name,
  label,
  hint,
  step = '1',
}: {
  form: UseFormReturn<SettingsValues>
  name: keyof SettingsValues & string
  label: string
  hint?: string
  step?: string
}) {
  return (
    <FormField
      id={`settings-${name}`}
      label={label}
      hint={hint}
      error={form.formState.errors[name]?.message}
    >
      <Input
        id={`settings-${name}`}
        type="number"
        step={step}
        min={0}
        {...form.register(name)}
      />
    </FormField>
  )
}
