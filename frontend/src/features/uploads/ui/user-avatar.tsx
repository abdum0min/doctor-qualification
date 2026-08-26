import { getInitials, toFileUrl } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

interface UserAvatarProps {
  fullname: string
  avatarUrl?: string | null
  className?: string
}

/** Rasm yo'q bo'lsa yoki yuklanmasa — ism bosh harflari ko'rinadi. */
export function UserAvatar({ fullname, avatarUrl, className }: UserAvatarProps) {
  return (
    <Avatar className={cn('size-8', className)}>
      <AvatarImage src={toFileUrl(avatarUrl)} alt={fullname} />
      <AvatarFallback>{getInitials(fullname)}</AvatarFallback>
    </Avatar>
  )
}
