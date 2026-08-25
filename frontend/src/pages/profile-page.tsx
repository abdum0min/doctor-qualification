import { useCurrentUser } from '@/features/auth'
import { DoctorProfileForm, useDoctorProfile } from '@/features/doctors'
import type { ApiError } from '@/shared/api'
import { getInitials } from '@/shared/lib/format'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function ProfilePage() {
  const user = useCurrentUser()
  const { data: profile, isLoading, isError, error } = useDoctorProfile()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Profil</h2>
        <p className="text-sm text-muted-foreground">
          Sertifikatda ko'rinadigan ma'lumotlar shu yerdan olinadi.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(profile?.fullname ?? user?.fullname ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-lg">
              {profile?.fullname ?? user?.fullname}
            </CardTitle>
            <CardDescription className="truncate">{user?.email}</CardDescription>
            <Badge variant="info">Shifokor</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <AsyncState
            isLoading={isLoading}
            isError={isError}
            errorMessage={(error as ApiError | null)?.message}
          >
            {profile && <DoctorProfileForm profile={profile} />}
          </AsyncState>
        </CardContent>
      </Card>
    </div>
  )
}
