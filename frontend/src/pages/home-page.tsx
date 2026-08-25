import { ArrowUpRight, Boxes, Palette, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useCurrentUser } from '@/features/auth'
import { APP, ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

const STARTING_POINTS = [
  {
    icon: Palette,
    title: 'Design System',
    description:
      'Barcha shadcn komponentlari bitta sahifada — nusxa olib ishlataverasiz.',
    to: ROUTES.designSystem,
  },
  {
    icon: ShieldCheck,
    title: 'Auth tayyor',
    description:
      'Register, login, logout, JWT va rolga asoslangan route guard`lar ulangan.',
    to: ROUTES.profile,
  },
  {
    icon: Boxes,
    title: 'Feature qo`shish',
    description:
      '`src/features/<nom>/` — api, model, ui. Sahifa `src/pages/` ichida.',
    to: ROUTES.designSystem,
  },
]

export function HomePage() {
  const user = useCurrentUser()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Salom, {user?.fullname ?? 'foydalanuvchi'} 👋
        </h2>
        <p className="text-sm text-muted-foreground">
          {APP.name} — bu bo'sh boshlang'ich sahifa. Loyihangizning asosiy ekranini
          shu yerda quring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STARTING_POINTS.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <item.icon className="size-5 text-primary" />
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to={item.to}>
                  Ochish
                  <ArrowUpRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
