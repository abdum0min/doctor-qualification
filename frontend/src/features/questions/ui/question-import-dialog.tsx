import { useRef, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Download, Upload } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Spinner } from '@/shared/ui/spinner'
import { useImportQuestions } from '../api/questions-queries'
import type { Difficulty, ImportResult } from '../model/types'
import { DifficultySelect } from './difficulty-select'

/** Excel UTF-8 ni to'g'ri o'qishi uchun fayl boshiga BOM qo'yiladi. */
const BOM = String.fromCharCode(0xfeff)

const TEMPLATE_HEADER = ['Savol', 'A', 'B', 'C', 'D', "To'g'ri javob", 'Daraja']

const TEMPLATE_ROW = [
  'Miokard infarktida birinchi navbatda qaysi tekshiruv o`tkaziladi?',
  'Umumiy qon tahlili',
  'EKG',
  'Rentgen',
  'UZI',
  'B',
  "O'rta",
]

/** Namuna faylni brauzerda yasaymiz — server uchun alohida endpoint kerak emas. */
function downloadTemplate() {
  const csv = [TEMPLATE_HEADER, TEMPLATE_ROW]
    .map((cells) =>
      cells.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','),
    )
    .join('\r\n')

  const blob = new Blob([BOM + csv], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'savollar-namuna.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function QuestionImportDialog({
  examId,
  children,
}: {
  examId: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [skipInvalidRows, setSkipInvalidRows] = useState(false)
  const [defaultDifficulty, setDefaultDifficulty] =
    useState<Difficulty>('INTERMEDIATE')
  const [result, setResult] = useState<ImportResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const importQuestions = useImportQuestions(examId)

  function reset() {
    setFile(null)
    setResult(null)
    setSkipInvalidRows(false)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next)

    if (!next) {
      reset()
    }
  }

  function onSubmit() {
    if (!file) return

    importQuestions.mutate(
      { file, skipInvalidRows, defaultDifficulty },
      { onSuccess: setResult },
    )
  }

  const blocked = Boolean(result && result.failed > 0 && result.imported === 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Savollarni fayldan import qilish</DialogTitle>
          <DialogDescription>
            CSV yoki Excel (.xlsx) fayl. Ustunlar:{' '}
            <span className="font-medium">
              Savol · A · B · C · D · To'g'ri javob · Daraja
            </span>
            . Ustunlar tartibi muhim emas; C–F va Daraja ixtiyoriy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField
            id="import-file"
            label="Fayl"
            required
            hint="Maksimal hajm 5 MB, 2000 tagacha savol"
          >
            <Input
              id="import-file"
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null)
                setResult(null)
              }}
            />
          </FormField>

          <FormField
            id="import-difficulty"
            label="Standart daraja"
            hint="`Daraja` ustuni bo'sh qatorlar uchun qo'llaniladi"
          >
            <DifficultySelect
              id="import-difficulty"
              value={defaultDifficulty}
              onChange={(value) =>
                setDefaultDifficulty(value ?? 'INTERMEDIATE')
              }
            />
          </FormField>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="import-skip"
              checked={skipInvalidRows}
              onCheckedChange={(checked) =>
                setSkipInvalidRows(checked === true)
              }
            />
            <Label
              htmlFor="import-skip"
              className="flex-1 text-sm leading-snug font-normal"
            >
              Xatoli qatorlarni tashlab ketish
              <span className="block text-xs text-muted-foreground">
                Belgilanmasa, faylda bitta xato bo'lsa ham hech narsa
                import qilinmaydi.
              </span>
            </Label>
          </div>

          {result && <ImportSummary result={result} blocked={blocked} />}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            onClick={downloadTemplate}
          >
            <Download className="size-4" />
            Namuna fayl
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {result && !blocked ? 'Yopish' : 'Bekor qilish'}
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!file || importQuestions.isPending}
              className="gap-2"
            >
              {importQuestions.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <Upload className="size-4" />
              )}
              Import qilish
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImportSummary({
  result,
  blocked,
}: {
  result: ImportResult
  blocked: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        <SummaryTile label="Qatorlar" value={result.totalRows} />
        <SummaryTile label="Yozildi" value={result.imported} tone="success" />
        <SummaryTile label="Takror" value={result.duplicates} />
        <SummaryTile label="Xato" value={result.failed} tone="danger" />
      </div>

      {blocked && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Hech narsa import qilinmadi</AlertTitle>
          <AlertDescription>
            Xatolarni tuzating yoki "Xatoli qatorlarni tashlab ketish"
            bandini belgilang.
          </AlertDescription>
        </Alert>
      )}

      {!blocked && result.failed === 0 && result.imported > 0 && (
        <Alert>
          <CircleCheck />
          <AlertTitle>Import yakunlandi</AlertTitle>
          <AlertDescription>
            {result.imported} ta savol imtihonga qo'shildi.
          </AlertDescription>
        </Alert>
      )}

      {result.errors.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/60">
              <tr>
                <th className="w-16 px-3 py-1.5 text-left font-medium">
                  Qator
                </th>
                <th className="px-3 py-1.5 text-left font-medium">Xato</th>
              </tr>
            </thead>
            <tbody>
              {result.errors.map((error) => (
                <tr key={`${error.row}-${error.message}`} className="border-t border-border">
                  <td className="px-3 py-1.5 tabular-nums text-muted-foreground">
                    {error.row}
                  </td>
                  <td className="px-3 py-1.5">{error.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'success' | 'danger'
}) {
  const color =
    tone === 'success' && value > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'danger' && value > 0
        ? 'text-destructive'
        : 'text-foreground'

  return (
    <div className="rounded-lg border border-border px-2 py-2">
      <p className={`text-lg font-semibold tabular-nums ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
