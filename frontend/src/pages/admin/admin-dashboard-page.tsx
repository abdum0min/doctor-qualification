import { useCurrentUser } from '@/features/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function AdminDashboardPage() {
  const user = useCurrentUser()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Salom, {user?.fullname ?? 'administrator'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Platforma boshqaruv paneli.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hisob ma'lumotlari</CardTitle>
          <CardDescription>Joriy administrator hisobi</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">F.I.Sh.</dt>
              <dd className="font-medium">{user?.fullname}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user?.email}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
