import { useEffect, useState } from 'react'
import { Award, GraduationCap, Search, Stethoscope, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useIsAdmin } from '@/features/auth'
import { buildRoute, ROUTES } from '@/shared/config'
import { useDebounce } from '@/shared/hooks'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command'
import { Kbd } from '@/shared/ui/kbd'
import { Spinner } from '@/shared/ui/spinner'
import { MIN_SEARCH_LENGTH, useGlobalSearch } from '../api/search-queries'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const isAdmin = useIsAdmin()

  const debounced = useDebounce(query, 300)
  const search = useGlobalSearch(debounced)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function go(path: string) {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  /** Har bir yozuv rolga mos bo'limda ochiladi. */
  const examPath = (examId: number) =>
    isAdmin ? buildRoute.examQuestions(examId) : ROUTES.exams

  const specialtyPath = () =>
    isAdmin ? ROUTES.adminSpecialties : ROUTES.exams

  const result = search.data
  const typedEnough = debounced.trim().length >= MIN_SEARCH_LENGTH
  const isEmpty =
    result &&
    result.exams.length === 0 &&
    result.specialties.length === 0 &&
    result.doctors.length === 0 &&
    result.certificates.length === 0

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden gap-2 text-muted-foreground md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Qidirish
        <Kbd>Ctrl K</Kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Qidirish"
        onClick={() => setOpen(true)}
      >
        <Search />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Qidiruv"
        description="Imtihon, mutaxassislik yoki sertifikat bo'yicha qidiring"
      >
        {/* Filtrlash serverda bajariladi — cmdk o'z filtrini qo'llamasin. */}
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={
              isAdmin
                ? 'Imtihon, mutaxassislik, shifokor yoki sertifikat...'
                : 'Imtihon, mutaxassislik yoki sertifikat raqami...'
            }
          />

          <CommandList>
            {!typedEnough && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Qidirish uchun kamida {MIN_SEARCH_LENGTH} ta belgi kiriting
              </p>
            )}

            {typedEnough && search.isFetching && (
              <div className="flex justify-center py-6">
                <Spinner className="size-5 text-muted-foreground" />
              </div>
            )}

            {typedEnough && !search.isFetching && isEmpty && (
              <CommandEmpty>Hech narsa topilmadi</CommandEmpty>
            )}

            {result && result.exams.length > 0 && (
              <CommandGroup heading="Imtihonlar">
                {result.exams.map((exam) => (
                  <CommandItem
                    key={exam.id}
                    value={`exam-${exam.id}`}
                    onSelect={() => go(examPath(exam.id))}
                  >
                    <GraduationCap />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{exam.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {exam.specialty.name} · {exam.questionCount} ta savol
                      </span>
                    </span>
                    {!exam.isActive && (
                      <Badge variant="secondary" className="text-[10px]">
                        Nofaol
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {result && result.certificates.length > 0 && (
              <CommandGroup heading="Sertifikatlar">
                {result.certificates.map((certificate) => (
                  <CommandItem
                    key={certificate.certificateId}
                    value={`certificate-${certificate.certificateId}`}
                    onSelect={() =>
                      go(buildRoute.verify(certificate.certificateId))
                    }
                  >
                    <Award />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-xs">
                        {certificate.certificateId}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {certificate.doctorFullname} · {certificate.examTitle}
                      </span>
                    </span>
                    {certificate.status === 'REVOKED' && (
                      <Badge variant="destructive" className="text-[10px]">
                        Bekor
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {result && result.doctors.length > 0 && (
              <CommandGroup heading="Shifokorlar">
                {result.doctors.map((doctor) => (
                  <CommandItem
                    key={doctor.id}
                    value={`doctor-${doctor.id}`}
                    onSelect={() => go(ROUTES.adminDoctors)}
                  >
                    <User />
                    <span className="min-w-0">
                      <span className="block truncate">{doctor.fullname}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[doctor.specialtyName, doctor.workplace]
                          .filter(Boolean)
                          .join(' · ') || 'Mutaxassislik tanlanmagan'}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {result && result.specialties.length > 0 && (
              <CommandGroup heading="Mutaxassisliklar">
                {result.specialties.map((specialty) => (
                  <CommandItem
                    key={specialty.id}
                    value={`specialty-${specialty.id}`}
                    onSelect={() => go(specialtyPath())}
                  >
                    <Stethoscope />
                    {specialty.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
