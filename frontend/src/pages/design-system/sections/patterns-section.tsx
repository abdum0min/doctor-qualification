import { Plus } from 'lucide-react'

import { useTableQuery } from '@/shared/hooks'
import { Button } from '@/shared/ui/button'
import { PageShell } from '@/shared/ui/page-shell'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Demo, Section } from '../ui/section'

const API_SNIPPET = `// features/posts/api/posts-api.ts
import { ENDPOINTS, http } from '@/shared/api'

export const postsApi = {
  list: (params: PostsParams) => http.list<Post>(ENDPOINTS.posts.root, params),
  byId: (id: number) => http.get<Post>(ENDPOINTS.posts.byId(id)),
  create: (body: PostValues) => http.post<Post>(ENDPOINTS.posts.root, body),
  update: (id: number, body: PostValues) =>
    http.patch<Post>(ENDPOINTS.posts.byId(id), body),
  remove: (id: number) => http.delete<null>(ENDPOINTS.posts.byId(id)),
}`

const QUERY_SNIPPET = `// features/posts/api/posts-queries.ts
export const postKeys = {
  all: ['posts'] as const,
  list: (params: PostsParams) => [...postKeys.all, 'list', params] as const,
}

export function usePosts(params: PostsParams) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => postsApi.list(params),
  })
}

export function useCreatePost() {
  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      toast.success('Yaratildi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}`

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  )
}

export function PatternsSection() {
  const table = useTableQuery(10)

  return (
    <Section
      id="patterns"
      title="Qoliplar"
      description="Har bir loyihada takrorlanadigan tayyor yechimlar — nusxa olib ishlating."
    >
      <Demo
        title="PageShell"
        description="Sarlavha, qidiruv, filtrlar va asosiy amal tugmasi bilan ro'yxat sahifasi qobig'i."
        layout="stack"
        wide
      >
        <PageShell
          title="Yozuvlar"
          description="Ro'yxat sahifalari uchun standart tuzilma"
          search={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Yozuv qidirish..."
          filters={
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                <SelectItem value="active">Faol</SelectItem>
                <SelectItem value="archived">Arxiv</SelectItem>
              </SelectContent>
            </Select>
          }
          action={
            <Button size="sm">
              <Plus />
              Qo'shish
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">
            Jadval yoki kartalar shu yerga joylashadi. Qidiruv `useTableQuery` orqali
            debounce qilinadi va so'rov parametriga tushadi:{' '}
            <b>{table.params.search || '—'}</b>
          </p>
        </PageShell>
      </Demo>

      <Demo title="API qatlami" description="Barcha so'rovlar `http` orqali — javob konverti avtomatik ochiladi." layout="stack">
        <CodeBlock>{API_SNIPPET}</CodeBlock>
      </Demo>

      <Demo title="TanStack Query" description="Query key'lar va mutatsiyalar uchun standart qolip." layout="stack">
        <CodeBlock>{QUERY_SNIPPET}</CodeBlock>
      </Demo>
    </Section>
  )
}
