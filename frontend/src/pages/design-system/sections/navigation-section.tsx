import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/shared/ui/menubar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/shared/ui/navigation-menu'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/pagination'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Demo, Section } from '../ui/section'

export function NavigationSection() {
  return (
    <Section
      id="navigation"
      title="Navigatsiya va xabarlar"
      description="Yo'naltirish elementlari hamda foydalanuvchiga qaytariladigan xabarlar."
    >
      <Demo title="Breadcrumb" layout="stack">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Bosh sahifa</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Bo'limlar</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Joriy sahifa</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Demo>

      <Demo
        title="Pagination"
        description="Raqamli sahifalash. Kursorli paginatsiya uchun `TablePagination` ishlatiladi."
        layout="stack"
      >
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Demo>

      <Demo title="NavigationMenu" layout="stack">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Mahsulot</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-64 gap-1 p-2">
                  <li>
                    <NavigationMenuLink href="#">Imkoniyatlar</NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#">Narxlar</NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#">Integratsiyalar</NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Hujjatlar</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-64 gap-1 p-2">
                  <li>
                    <NavigationMenuLink href="#">Boshlash</NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#">API</NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Demo>

      <Demo title="Menubar" layout="stack">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Fayl</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Yangi
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Ochish</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Chiqish</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Tahrir</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Ortga
                <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Oldinga</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Demo>

      <Demo title="ThemeToggle" description="Light / System / Dark — `next-themes` ustida.">
        <ThemeToggle />
      </Demo>

      <Demo title="Alert" description="Sahifa ichidagi doimiy xabarlar." layout="stack">
        <Alert>
          <Info />
          <AlertTitle>Ma'lumot uchun</AlertTitle>
          <AlertDescription>Sozlamalar 5 daqiqada bir sinxronlanadi.</AlertDescription>
        </Alert>

        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Xatolik yuz berdi</AlertTitle>
          <AlertDescription>Ma'lumotlarni yuklab bo'lmadi. Qayta urinib ko'ring.</AlertDescription>
        </Alert>
      </Demo>

      <Demo
        title="Toast (sonner)"
        description="Vaqtinchalik xabarlar. Mutatsiyalarda `onSuccess` / `onError` ichidan chaqiriladi."
        layout="stack"
      >
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success('Muvaffaqiyatli saqlandi')}>
            <CircleCheck />
            Success
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.error('Xatolik yuz berdi')}>
            <CircleAlert />
            Error
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.warning('Diqqat qiling')}>
            <TriangleAlert />
            Warning
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.info('Yangilik bor')}>
            <Info />
            Info
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                loading: 'Yuborilmoqda...',
                success: 'Yuborildi',
                error: 'Xato',
              })
            }
          >
            Promise
          </Button>
        </div>
      </Demo>
    </Section>
  )
}
