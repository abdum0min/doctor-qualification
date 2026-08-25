import { useState } from 'react'
import { FileQuestion, Plus } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { formatDate, getInitials } from '@/shared/lib/format'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { AspectRatio } from '@/shared/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/shared/ui/carousel'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { DataTable, type Column } from '@/shared/ui/data-table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty'
import { Progress } from '@/shared/ui/progress'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/ui/resizable'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'
import { Spinner } from '@/shared/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TablePagination } from '@/shared/ui/table-pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Demo, Section } from '../ui/section'

interface DemoRow {
  id: number
  name: string
  email: string
  status: 'active' | 'pending'
  createdAt: string
}

const ROWS: DemoRow[] = [
  { id: 1, name: "Abdumo'min Rasulov", email: 'abdumomin@mail.com', status: 'active', createdAt: '2026-01-12' },
  { id: 2, name: 'Dilshod Karimov', email: 'dilshod@mail.com', status: 'pending', createdAt: '2026-02-03' },
  { id: 3, name: 'Nodira Yusupova', email: 'nodira@mail.com', status: 'active', createdAt: '2026-02-19' },
]

const COLUMNS: Column<DemoRow>[] = [
  { key: 'name', header: 'Ism', cell: (row) => <span className="font-medium">{row.name}</span> },
  { key: 'email', header: 'Email', cell: (row) => row.email },
  {
    key: 'status',
    header: 'Holat',
    cell: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : 'warning'}>
        {row.status === 'active' ? 'Faol' : 'Kutilmoqda'}
      </Badge>
    ),
  },
  {
    key: 'createdAt',
    header: 'Sana',
    className: 'text-right',
    cell: (row) => formatDate(row.createdAt),
  },
]

const CHART_DATA = [
  { month: 'Yan', created: 42, done: 30 },
  { month: 'Fev', created: 58, done: 45 },
  { month: 'Mar', created: 36, done: 34 },
  { month: 'Apr', created: 71, done: 52 },
  { month: 'May', created: 64, done: 60 },
  { month: 'Iyn', created: 88, done: 71 },
]

const CHART_CONFIG = {
  created: { label: 'Yaratilgan', color: 'var(--chart-1)' },
  done: { label: 'Bajarilgan', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function DataSection() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Section
      id="data"
      title="Ma'lumot ko'rsatish"
      description="Jadval, grafik, ro'yxat va yuklanish holatlari."
    >
      <Demo
        title="DataTable"
        description="Ustunlar konfiguratsiyasi, skeleton va bo'sh holat ichida — ro'yxat sahifalari uchun asosiy komponent."
        layout="stack"
        wide
      >
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsLoading((value) => !value)}>
            {isLoading ? 'Yuklanishni to`xtatish' : 'Yuklanish holatini ko`rish'}
          </Button>
        </div>

        <DataTable data={isLoading ? [] : ROWS} columns={COLUMNS} rowKey={(row) => row.id} isLoading={isLoading} />

        <TablePagination
          meta={{ limit: 10, nextCursor: 'demo-cursor', hasMore: true }}
          onNext={() => {}}
          onPrev={() => {}}
          canGoBack
        />
      </Demo>

      <Demo title="Table" description="Xom jadval primitivi — maxsus tuzilmalar uchun." layout="stack">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mahsulot</TableHead>
              <TableHead className="text-right">Narx</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Asosiy tarif</TableCell>
              <TableCell className="text-right tabular-nums">120 000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Pro tarif</TableCell>
              <TableCell className="text-right tabular-nums">340 000</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Demo>

      <Demo title="Chart — ustunli" description="recharts + ChartContainer. Ranglar CSS o'zgaruvchilardan." layout="stack">
        <ChartContainer config={CHART_CONFIG} className="h-56 w-full">
          <BarChart data={CHART_DATA}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="created" fill="var(--color-created)" radius={4} />
            <Bar dataKey="done" fill="var(--color-done)" radius={4} />
          </BarChart>
        </ChartContainer>
      </Demo>

      <Demo title="Chart — chiziqli" layout="stack">
        <ChartContainer config={CHART_CONFIG} className="h-56 w-full">
          <LineChart data={CHART_DATA}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line dataKey="created" stroke="var(--color-created)" strokeWidth={2} dot={false} />
            <Line dataKey="done" stroke="var(--color-done)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </Demo>

      <Demo title="Avatar" description="Yakka, guruh va sanoq bilan.">
        <Avatar>
          <AvatarFallback>{getInitials("Abdumo'min Rasulov")}</AvatarFallback>
        </Avatar>

        <AvatarGroup>
          {['Ali Valiyev', 'Dilshod Karimov', 'Nodira Yusupova'].map((name) => (
            <Avatar key={name}>
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>+5</AvatarGroupCount>
        </AvatarGroup>
      </Demo>

      <Demo title="Progress va Skeleton" layout="stack">
        <Progress value={68} />
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Yuklanmoqda...
        </div>
      </Demo>

      <Demo title="Empty" description="Ma'lumot yo'q holati uchun standart blok." layout="stack">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion />
            </EmptyMedia>
            <EmptyTitle>Hozircha yozuv yo'q</EmptyTitle>
            <EmptyDescription>Birinchi yozuvni qo'shib boshlang.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">
              <Plus />
              Qo'shish
            </Button>
          </EmptyContent>
        </Empty>
      </Demo>

      <Demo title="Tabs" layout="stack">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Umumiy</TabsTrigger>
            <TabsTrigger value="activity">Faoliyat</TabsTrigger>
            <TabsTrigger value="settings">Sozlamalar</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-3 text-sm text-muted-foreground">
            Umumiy ma'lumotlar shu yerda ko'rsatiladi.
          </TabsContent>
          <TabsContent value="activity" className="pt-3 text-sm text-muted-foreground">
            Oxirgi harakatlar ro'yxati.
          </TabsContent>
          <TabsContent value="settings" className="pt-3 text-sm text-muted-foreground">
            Sozlamalar formasi.
          </TabsContent>
        </Tabs>
      </Demo>

      <Demo title="Accordion va Collapsible" layout="stack">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Template nimalarni o'z ichiga oladi?</AccordionTrigger>
            <AccordionContent>
              Auth, dizayn tizimi, API qatlami, theme va route guard'lar.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Yangi sahifa qanday qo'shiladi?</AccordionTrigger>
            <AccordionContent>
              `src/pages/` ichida komponent yarating va `app/router/index.tsx` ga qo'shing.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              Qo'shimcha ma'lumot
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
            Collapsible — kerak bo'lganda ochiladigan oddiy blok.
          </CollapsibleContent>
        </Collapsible>
      </Demo>

      <Demo title="ScrollArea" description="Balandligi cheklangan ro'yxatlar uchun." layout="stack">
        <ScrollArea className="h-40 rounded-lg border p-3">
          <div className="space-y-2">
            {Array.from({ length: 20 }, (_, index) => (
              <p key={index} className="text-sm">
                Element #{index + 1}
              </p>
            ))}
          </div>
        </ScrollArea>
      </Demo>

      <Demo title="Carousel va AspectRatio" layout="stack">
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {[1, 2, 3].map((index) => (
              <CarouselItem key={index}>
                <AspectRatio
                  ratio={16 / 9}
                  className="flex items-center justify-center rounded-lg bg-muted text-2xl font-semibold"
                >
                  {index}
                </AspectRatio>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Demo>

      <Demo title="Resizable" description="O'lchami o'zgaruvchan panellar." layout="stack" wide>
        <ResizablePanelGroup orientation="horizontal" className="h-40 rounded-lg border">
          <ResizablePanel defaultSize={35}>
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
              Yon panel
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65}>
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
              Asosiy kontent
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Demo>
    </Section>
  )
}
