import { useState } from 'react'
import { useDoctorProfile } from '@/features/doctors'
import { ExamCard, useActiveExams } from '@/features/exams'
import { SpecialtySelect } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { AsyncState } from '@/shared/ui/async-state'

export function ExamsPage() {
  const { data: profile } = useDoctorProfile()
  // `undefined` — shifokor hali tanlamagan, `null` — "Barcha mutaxassisliklar".
  // Ikkisi farqlanmasa, hammasini tanlash o'z yo'nalishiga qaytib ketadi.
  const [specialtyId, setSpecialtyId] = useState<number | null | undefined>()

  // Standart holatda shifokorning o'z yo'nalishi ko'rsatiladi.
  const activeSpecialtyId =
    specialtyId === undefined ? (profile?.specialty?.id ?? null) : specialtyId
  const { data, isLoading, isError, error } = useActiveExams(
    activeSpecialtyId ?? undefined,
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Imtihonlar</h2>
          <p className="text-sm text-muted-foreground">
            Mutaxassisligingiz bo'yicha imtihon tanlang va bilimingizni sinang.
          </p>
        </div>

        <div className="w-56">
          <SpecialtySelect
            clearable
            value={activeSpecialtyId}
            onChange={setSpecialtyId}
            placeholder="Barcha mutaxassisliklar"
            clearLabel="Barcha mutaxassisliklar"
          />
        </div>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
        isEmpty={data?.length === 0}
        emptyTitle="Imtihon topilmadi"
        emptyDescription="Tanlangan yo'nalish bo'yicha hozircha faol imtihon yo'q."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
        </div>
      </AsyncState>
    </div>
  )
}
