import { useState } from 'react'
import {
  Bold,
  ChevronDown,
  Download,
  Italic,
  Plus,
  Trash2,
  Underline,
} from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/shared/ui/button-group'
import { Kbd, KbdGroup } from '@/shared/ui/kbd'
import { Spinner } from '@/shared/ui/spinner'
import { Toggle } from '@/shared/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { Demo, Section } from '../ui/section'

const BUTTON_VARIANTS = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
] as const

const BADGE_VARIANTS = [
  'default',
  'secondary',
  'outline',
  'destructive',
  'success',
  'warning',
  'info',
  'ghost',
] as const

export function ButtonsSection() {
  const [loading, setLoading] = useState(false)

  const simulateRequest = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1600)
  }

  return (
    <Section
      id="buttons"
      title="Tugmalar va nishonlar"
      description="Asosiy harakat elementlari. `variant` — vazifasiga qarab, `size` — joyiga qarab tanlanadi."
    >
      <Demo title="Button — variantlar">
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </Demo>

      <Demo title="Button — o'lchamlar">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button>default</Button>
        <Button size="lg">lg</Button>
        <Button size="icon" aria-label="Qo'shish">
          <Plus />
        </Button>
        <Button size="icon-sm" variant="outline" aria-label="Yuklab olish">
          <Download />
        </Button>
      </Demo>

      <Demo title="Button — holatlar" description="Ikonka, yuklanish va o'chirilgan holat.">
        <Button onClick={simulateRequest} disabled={loading}>
          {loading ? <Spinner /> : <Plus />}
          {loading ? 'Yuborilmoqda...' : 'Yaratish'}
        </Button>
        <Button variant="destructive">
          <Trash2 />
          O'chirish
        </Button>
        <Button disabled>O'chirilgan</Button>
        <Button variant="outline">
          Ko'proq
          <ChevronDown />
        </Button>
      </Demo>

      <Demo
        title="ButtonGroup"
        description="Bir-biriga bog'liq tugmalarni yagona blokka birlashtiradi."
        layout="stack"
      >
        <ButtonGroup>
          <Button variant="outline">Kun</Button>
          <Button variant="outline">Hafta</Button>
          <Button variant="outline">Oy</Button>
        </ButtonGroup>

        <ButtonGroup>
          <ButtonGroupText>Saralash</ButtonGroupText>
          <ButtonGroupSeparator />
          <Button variant="outline">
            Sana
            <ChevronDown />
          </Button>
        </ButtonGroup>
      </Demo>

      <Demo title="Toggle va ToggleGroup" description="Yoqilgan/o'chirilgan holatlar uchun.">
        <Toggle aria-label="Qalin">
          <Bold />
        </Toggle>

        <ToggleGroup type="multiple" variant="outline">
          <ToggleGroupItem value="bold" aria-label="Qalin">
            <Bold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Kursiv">
            <Italic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Tagi chizilgan">
            <Underline />
          </ToggleGroupItem>
        </ToggleGroup>
      </Demo>

      <Demo title="Badge — variantlar" description="Status va toifalarni belgilash uchun.">
        {BADGE_VARIANTS.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </Demo>

      <Demo title="Kbd" description="Klaviatura qisqartmalarini ko'rsatish.">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>⇧</Kbd>
          <Kbd>Enter</Kbd>
        </KbdGroup>
        <Kbd>Esc</Kbd>
      </Demo>
    </Section>
  )
}
