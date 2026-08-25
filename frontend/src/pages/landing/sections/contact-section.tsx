import { Mail, MapPin, Phone } from 'lucide-react'

import { Card, CardContent } from '@/shared/ui/card'

const CONTACTS = [
  { icon: Mail, label: 'Email', value: 'info@doctorqualification.uz' },
  { icon: Phone, label: 'Telefon', value: '+998 71 200 00 00' },
  { icon: MapPin, label: 'Manzil', value: 'Toshkent shahri' },
]

export function ContactSection() {
  return (
    <section id="contact" className="border-t border-border bg-muted/30 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Aloqa</h2>
          <p className="text-sm text-muted-foreground">
            Savollaringiz bo'lsa biz bilan bog'laning
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {CONTACTS.map((contact) => (
            <Card key={contact.label}>
              <CardContent className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <contact.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{contact.label}</p>
                  <p className="truncate text-sm font-medium">{contact.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
