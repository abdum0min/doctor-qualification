import { useCurrentUser } from '@/features/auth'
import { DoctorProfileForm, useDoctorProfile } from '@/features/doctors'
import { AvatarUpload, UserAvatar } from '@/features/uploads'
import type { ApiError } from '@/shared/api'
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
          <UserAvatar
            fullname={profile?.fullname ?? user?.fullname ?? ''}
            avatarUrl={profile?.avatarUrl}
            className="size-14"
          />
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-lg">
              {profile?.fullname ?? user?.fullname}
            </CardTitle>
            <CardDescription className="truncate">{user?.email}</CardDescription>
            <Badge variant="info">Shifokor</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {profile && (
            <div className="border-b border-border pb-6">
              <AvatarUpload
                fullname={profile.fullname}
                avatarUrl={profile.avatarUrl}
              />
            </div>
          )}

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
