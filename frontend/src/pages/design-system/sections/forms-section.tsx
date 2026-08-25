import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Mail, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { formatDate } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/shared/ui/field'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/shared/ui/input-group'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/shared/ui/input-otp'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Slider } from '@/shared/ui/slider'
import { Spinner } from '@/shared/ui/spinner'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { Demo, Section } from '../ui/section'

const demoSchema = z.object({
  title: z.string().min(3, 'Kamida 3 ta belgi'),
  category: z.string().min(1, 'Toifani tanlang'),
  notes: z.string().max(200, 'Ko`pi bilan 200 ta belgi').optional(),
})

type DemoValues = z.infer<typeof demoSchema>

/** react-hook-form + zod + FormField — loyihadagi barcha formalar uchun namuna. */
function ExampleForm() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DemoValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: { title: '', category: '', notes: '' },
  })

  const onSubmit = async (values: DemoValues) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    toast.success('Forma yuborildi', { description: JSON.stringify(values) })
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField id="title" label="Sarlavha" error={errors.title?.message} required>
        <Input
          id="title"
          placeholder="Masalan: Yangi vazifa"
          aria-invalid={Boolean(errors.title)}
          {...register('title')}
        />
      </FormField>

      <FormField id="category" label="Toifa" error={errors.category?.message} required>
        <Select onValueChange={(value) => setValue('category', value, { shouldValidate: true })}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="design">Dizayn</SelectItem>
            <SelectItem value="development">Dasturlash</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        id="notes"
        label="Izoh"
        error={errors.notes?.message}
        hint="Ixtiyoriy, 200 belgigacha"
      >
        <Textarea id="notes" rows={3} placeholder="Qisqacha izoh..." {...register('notes')} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Saqlash
        </Button>
        <Button type="button" variant="ghost" onClick={() => reset()}>
          Tozalash
        </Button>
      </div>
    </form>
  )
}

function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-56 justify-start font-normal">
          <CalendarIcon />
          {date ? formatDate(date) : 'Sanani tanlang'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} autoFocus />
      </PopoverContent>
    </Popover>
  )
}

export function FormsSection() {
  const [volume, setVolume] = useState([40])
  const [otp, setOtp] = useState('')

  return (
    <Section
      id="forms"
      title="Formalar"
      description="Barcha kiritish elementlari. Validatsiya — `zod`, holat boshqaruvi — `react-hook-form`."
    >
      <Demo title="Input" description="Turli tur va holatlar." layout="stack">
        <div className="space-y-2">
          <Label htmlFor="ds-input">Oddiy</Label>
          <Input id="ds-input" placeholder="Matn kiriting" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ds-input-invalid">Xato holati</Label>
          <Input id="ds-input-invalid" defaultValue="noto'g'ri qiymat" aria-invalid />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ds-input-disabled">O'chirilgan</Label>
          <Input id="ds-input-disabled" placeholder="Tahrirlab bo'lmaydi" disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ds-password">Parol (PasswordInput)</Label>
          <PasswordInput id="ds-password" placeholder="••••••••" />
        </div>
      </Demo>

      <Demo
        title="InputGroup"
        description="Maydonga ikonka, prefiks yoki tugma biriktirish."
        layout="stack"
      >
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Qidirish..." />
        </InputGroup>

        <InputGroup>
          <InputGroupAddon>
            <Mail />
          </InputGroupAddon>
          <InputGroupInput placeholder="email@example.com" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Yuborish</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Demo>

      <Demo title="Textarea" layout="stack">
        <div className="space-y-2">
          <Label htmlFor="ds-textarea">Tavsif</Label>
          <Textarea id="ds-textarea" rows={4} placeholder="Bir necha qatorli matn..." />
        </div>
      </Demo>

      <Demo title="Select" layout="stack">
        <div className="space-y-2">
          <Label htmlFor="ds-select">Viloyat</Label>
          <Select defaultValue="tashkent">
            <SelectTrigger id="ds-select" className="w-full">
              <SelectValue placeholder="Tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tashkent">Toshkent</SelectItem>
              <SelectItem value="samarkand">Samarqand</SelectItem>
              <SelectItem value="bukhara">Buxoro</SelectItem>
              <SelectItem value="andijan">Andijon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Demo>

      <Demo title="Checkbox, Radio, Switch" layout="stack">
        <div className="flex items-center gap-2">
          <Checkbox id="ds-check" defaultChecked />
          <Label htmlFor="ds-check" className="font-normal">
            Shartlarga roziman
          </Label>
        </div>

        <RadioGroup defaultValue="b" className="space-y-1">
          {['a', 'b', 'c'].map((value) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`ds-radio-${value}`} />
              <Label htmlFor={`ds-radio-${value}`} className="font-normal uppercase">
                Variant {value}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex items-center gap-2">
          <Switch id="ds-switch" defaultChecked />
          <Label htmlFor="ds-switch" className="font-normal">
            Bildirishnomalar
          </Label>
        </div>
      </Demo>

      <Demo title="Slider" layout="stack">
        <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
        <p className="text-sm text-muted-foreground tabular-nums">Qiymat: {volume[0]}</p>
      </Demo>

      <Demo title="InputOTP" description="SMS yoki email tasdiqlash kodi uchun." layout="stack">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <p className="text-sm text-muted-foreground">Kiritilgan: {otp || '—'}</p>
      </Demo>

      <Demo title="Calendar + Popover" description="Sana tanlash uchun standart qolip.">
        <DatePickerDemo />
      </Demo>

      <Demo
        title="Field"
        description="shadcn'ning yangi forma primitivi — murakkab formalarni tuzish uchun."
        layout="stack"
      >
        <FieldSet>
          <FieldLegend>Yetkazib berish</FieldLegend>
          <FieldGroup>
            <Field orientation="horizontal">
              <Checkbox id="ds-field-express" />
              <FieldLabel htmlFor="ds-field-express" className="font-normal">
                Tezkor yetkazish
              </FieldLabel>
            </Field>
            <Field>
              <FieldLabel htmlFor="ds-field-address">Manzil</FieldLabel>
              <Input id="ds-field-address" placeholder="Ko'cha, uy" />
              <FieldDescription>Kuryer shu manzilga keladi.</FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
      </Demo>

      <Demo
        title="To'liq forma namunasi"
        description="react-hook-form + zod + FormField. Yangi forma yozayotganda shu fayldan nusxa oling."
        layout="stack"
        wide
      >
        <ExampleForm />
      </Demo>
    </Section>
  )
}
