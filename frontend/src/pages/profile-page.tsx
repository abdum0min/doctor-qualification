import { useCurrentUser } from '@/features/auth'
import { formatDate, getInitials } from '@/shared/lib/format'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'

export function ProfilePage() {
  const user = useCurrentUser()

  if (!user) return null

  const rows = [
    { label: "To'liq ism", value: user.fullname },
    { label: 'Email', value: user.email },
    { label: 'Rol', value: user.role === 'ADMIN' ? 'Admin' : 'User' },
    { label: 'Holat', value: user.isActive ? 'Faol' : 'Bloklangan' },
    { label: "Ro'yxatdan o'tgan", value: formatDate(user.createdAt) },
    { label: 'Oxirgi yangilanish', value: formatDate(user.updatedAt) },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">Hisobingiz ma'lumotlari</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">{getInitials(user.fullname)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-lg">{user.fullname}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
              {user.role === 'ADMIN' ? 'Admin' : 'User'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Separator className="mb-4" />
          <dl className="space-y-3">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 text-sm">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
