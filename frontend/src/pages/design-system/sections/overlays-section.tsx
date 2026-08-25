import { useEffect, useState } from 'react'
import {
  Calculator,
  CreditCard,
  Copy,
  MoreHorizontal,
  Pencil,
  Settings,
  Trash2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/shared/ui/command'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/shared/ui/context-menu'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/ui/hover-card'
import { Input } from '@/shared/ui/input'
import { Kbd } from '@/shared/ui/kbd'
import { Label } from '@/shared/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { Demo, Section } from '../ui/section'

function CommandPaletteDemo() {
  const [open, setOpen] = useState(false)

  // Ctrl/Cmd + K — global qidiruv paneli uchun standart qisqartma.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Qidiruv paneli
        <Kbd>Ctrl K</Kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buyruq yoki sahifa nomini yozing..." />
        <CommandList>
          <CommandEmpty>Hech narsa topilmadi.</CommandEmpty>
          <CommandGroup heading="Tavsiyalar">
            <CommandItem onSelect={() => setOpen(false)}>
              <User />
              Profil
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <CreditCard />
              To'lovlar
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Sozlamalar">
            <CommandItem onSelect={() => setOpen(false)}>
              <Settings />
              Umumiy sozlamalar
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <Calculator />
              Kalkulyator
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export function OverlaysSection() {
  return (
    <Section
      id="overlays"
      title="Oynalar va menyular"
      description="Asosiy oqimni to'xtatadigan yoki ustiga chiqadigan elementlar."
    >
      <Demo title="Dialog" description="Forma yoki tasdiqlash uchun markaziy oyna.">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Dialogni ochish</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profilni tahrirlash</DialogTitle>
              <DialogDescription>
                O'zgarishlar saqlangandan so'ng darhol kuchga kiradi.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="ds-dialog-name">Ism</Label>
              <Input id="ds-dialog-name" defaultValue="Abdumo'min" />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Bekor qilish</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={() => toast.success('Saqlandi')}>Saqlash</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Demo>

      <Demo
        title="ConfirmDialog"
        description="AlertDialog ustidagi tayyor o'ram — o'chirish tasdiqlari uchun."
      >
        <ConfirmDialog
          title="Yozuvni o'chirasizmi?"
          description="Bu amalni ortga qaytarib bo'lmaydi."
          onConfirm={() => toast.success("O'chirildi")}
        >
          <Button variant="destructive">
            <Trash2 />
            O'chirish
          </Button>
        </ConfirmDialog>
      </Demo>

      <Demo title="Sheet" description="Yon paneldan chiqadigan oyna.">
        {(['right', 'left', 'top', 'bottom'] as const).map((side) => (
          <Sheet key={side}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                {side}
              </Button>
            </SheetTrigger>
            <SheetContent side={side}>
              <SheetHeader>
                <SheetTitle>Sozlamalar</SheetTitle>
                <SheetDescription>Yon paneldagi qo'shimcha amallar.</SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <Button>Saqlash</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ))}
      </Demo>

      <Demo title="Drawer" description="Mobil uchun pastdan surilib chiqadigan panel.">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Drawer'ni ochish</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filtrlar</DrawerTitle>
              <DrawerDescription>Ro'yxatni saralash parametrlari.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Qo'llash</Button>
              <DrawerClose asChild>
                <Button variant="ghost">Yopish</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Demo>

      <Demo title="Popover, HoverCard, Tooltip">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-2">
            <p className="text-sm font-medium">O'lchamlar</p>
            <p className="text-sm text-muted-foreground">
              Popover ichida forma yoki qo'shimcha sozlamalar bo'lishi mumkin.
            </p>
          </PopoverContent>
        </Popover>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">@abdumomin</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-72">
            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium">Abdumo'min</p>
                <p className="text-sm text-muted-foreground">
                  Sichqoncha ustiga kelganda ochiladi — profil ko'rinishi uchun qulay.
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Nusxalash">
              <Copy />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Nusxalash</TooltipContent>
        </Tooltip>
      </Demo>

      <Demo title="DropdownMenu va ContextMenu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Amallar">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Amallar</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil />
              Tahrirlash
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy />
              Nusxalash
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 />
              O'chirish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ContextMenu>
          <ContextMenuTrigger className="flex h-9 items-center rounded-lg border border-dashed px-4 text-sm text-muted-foreground">
            O'ng tugmani bosing
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem>
              <Pencil />
              Tahrirlash
              <ContextMenuShortcut>⌘E</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">
              <Trash2 />
              O'chirish
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Demo>

      <Demo
        title="Command"
        description="Qidiruv paneli (⌘K) va sahifa ichidagi ro'yxat ko'rinishi."
        layout="stack"
        wide
      >
        <CommandPaletteDemo />

        <Command className="rounded-lg border">
          <CommandInput placeholder="Filtrlash..." />
          <CommandList>
            <CommandEmpty>Natija yo'q.</CommandEmpty>
            <CommandGroup heading="Foydalanuvchilar">
              <CommandItem>
                <User />
                Abdumo'min
              </CommandItem>
              <CommandItem>
                <User />
                Dilshod
              </CommandItem>
              <CommandItem>
                <User />
                Nodira
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Demo>
    </Section>
  )
}
