import { useRef, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Spinner } from '@/shared/ui/spinner'
import { useRemoveAvatar, useUploadAvatar } from '../api/uploads-queries'
import { UserAvatar } from './user-avatar'

const ACCEPTED = 'image/jpeg,image/png,image/webp'
const MAX_MB = 5

interface AvatarUploadProps {
  fullname: string
  avatarUrl: string | null
}

export function AvatarUpload({ fullname, avatarUrl }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const upload = useUploadAvatar()
  const remove = useRemoveAvatar()
  const isPending = upload.isPending || remove.isPending

  function onFileChange(file: File | undefined) {
    setError(null)

    if (!file) return

    // Serverda ham tekshiriladi — bu shunchaki tezroq javob berish uchun.
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Rasm hajmi ${MAX_MB} MB dan oshmasin`)
      return
    }

    upload.mutate(file, {
      onSettled: () => {
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      },
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative">
        <UserAvatar
          fullname={fullname}
          avatarUrl={avatarUrl}
          className="size-16"
        />
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Spinner className="size-5" />
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" />
            {avatarUrl ? "Rasmni almashtirish" : 'Rasm yuklash'}
          </Button>

          {avatarUrl && (
            <ConfirmDialog
              title="Rasmni o'chirish"
              description="Profil rasmi o'chiriladi va o'rniga ism bosh harflari ko'rinadi."
              confirmText="O'chirish"
              onConfirm={() => remove.mutate()}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive"
                disabled={isPending}
              >
                <Trash2 className="size-4" />
                O'chirish
              </Button>
            </ConfirmDialog>
          )}
        </div>

        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            JPEG, PNG yoki WebP · {MAX_MB} MB gacha
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(event) => onFileChange(event.target.files?.[0])}
      />
    </div>
  )
}
