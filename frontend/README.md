# Frontend Starter — React + Vite + Tailwind v4 + shadcn/ui

Yangi loyihalarni noldan boshlamaslik uchun tayyor **template**. Ichida auth oqimi,
API qatlami, theme, route guard'lar va to'liq dizayn tizimi bor. Biznes ekranlari **yo'q**.

---

## Nima tayyor

| Qism | Tafsilot |
| --- | --- |
| **Auth** | Login, Register, Logout, JWT localStorage'da, `/auth/me` orqali sessiya tiklash |
| **Route guard** | `ProtectedRoute`, `GuestRoute`, `AdminRoute` |
| **API qatlami** | Axios instance + interceptor'lar, `http` helper javob konvertini o'zi ochadi |
| **Server state** | TanStack Query (`queryClient` sozlangan), mutatsiyalarda toast |
| **Client state** | Zustand (`useAuthStore`) |
| **Formalar** | react-hook-form + zod + `FormField` |
| **Theme** | next-themes (light / system / dark), `ThemeToggle` |
| **UI kutubxonasi** | 57+ shadcn komponent `src/shared/ui/` ichida |
| **Design System** | `/design-system` — barcha komponentlar jonli holatda |
| **Layout** | Yig'iladigan sidebar, mobil sheet, user menyu, responsive |
| **Kod bo'linishi** | Og'ir sahifalar `React.lazy` bilan alohida chunk'ga chiqadi |

---

## Papka tuzilishi (Feature-Sliced'ga yaqin)

```
src/
├── app/                       # ilova qobig'i
│   ├── layouts/               # AuthLayout, DashboardLayout, NAV_ITEMS
│   ├── providers/             # theme, query, router, tooltip, toaster
│   ├── router/                # marshrutlar va guard'lar
│   └── index.tsx
├── features/                  # biznes bo'laklari (har biri mustaqil)
│   └── auth/
│       ├── api/               # so'rovlar + react-query hook'lari
│       ├── model/             # tiplar, zod sxemalar, zustand store
│       ├── ui/                # feature'ga tegishli komponentlar
│       └── index.ts           # ommaviy eksportlar (public API)
├── pages/                     # marshrutga bog'langan ekranlar
│   └── design-system/         # bo'limlarga ajratilgan dizayn tizimi
├── shared/                    # domenga bog'liq bo'lmagan umumiy qatlam
│   ├── api/                   # axios, http, ENDPOINTS, tiplar
│   ├── config/                # APP, ROUTES, env
│   ├── hooks/                 # useDebounce, useTableQuery
│   ├── lib/                   # cn, format, queryClient, tokenStorage
│   └── ui/                    # shadcn + maxsus umumiy komponentlar
├── index.css                  # Tailwind + mavzu o'zgaruvchilari
└── main.tsx
```

**Qoida:** `shared/` hech qachon `features/` yoki `pages/` dan import qilmaydi.
`features/` bir-birini faqat `index.ts` orqali chaqiradi.

---

## Ishga tushirish

```bash
npm install
cp .env.example .env      # VITE_API_URL ni backend manziliga sozlang
npm run dev
```

- Ilova — <http://localhost:5173>
- Design System — <http://localhost:5173/design-system>

| Buyruq | Vazifasi |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | `tsc -b` + production build |
| `npm run preview` | Build'ni lokal ko'rish |
| `npm run lint` | ESLint |

---

## Yangi loyihani boshlash

1. `src/shared/config/app.ts` — nom, tagline, tavsifni yozing.
2. `index.html` — `<title>` va `description`ni yangilang.
3. `src/index.css` — `--primary` va boshqa ranglarni brendga moslang.
4. `src/shared/ui/brand-logo.tsx` — logo SVG'ini almashtiring.
5. `src/app/layouts/nav-items.ts` — sidebar menyusini tuzing.
6. Yangi feature qo'shing (pastda).

---

## Yangi feature qo'shish tartibi

```
src/features/posts/
├── api/
│   ├── posts-api.ts        # http chaqiruvlari
│   └── posts-queries.ts    # useQuery / useMutation
├── model/
│   ├── types.ts            # Post, PostsParams
│   └── schemas.ts          # zod sxemalar
├── ui/
│   ├── posts-table.tsx
│   └── post-form-dialog.tsx
└── index.ts                # public API
```

1. `shared/api/endpoints.ts` ga yangi manzillarni qo'shing.
2. `api/posts-api.ts` — faqat `http` orqali so'rov yuboring.
3. `api/posts-queries.ts` — query key'lar + `useQuery`/`useMutation`, xatoni toast bilan
   ko'rsating, muvaffaqiyatda `invalidateQueries` chaqiring.
4. `pages/posts-page.tsx` — `PageShell` + `DataTable` + `TablePagination` +
   `useTableQuery` qolipidan foydalaning (`/design-system` → **Qoliplar** bo'limi).
5. `app/router/index.tsx` va `app/layouts/nav-items.ts` ga qo'shing.

---

## API konventsiyasi

Backend har bir javobni bir xil konvertda qaytaradi. `http` helper `data`ni o'zi ochadi:

```ts
const user = await http.get<User>('/auth/me')          // -> User
const { items, meta } = await http.list<Post>('/posts') // -> kursorli ro'yxat
```

Xatolar `ApiError` ko'rinishida (`{ status, message, errors? }`) `reject` bo'ladi —
`onError: (error: ApiError) => toast.error(error.message)` deb ushlanadi.
401 kelganda token avtomatik tozalanadi.

---

## Deploy (Vercel)

1. Root directory — `frontend`.
2. Build command — `npm run build`, Output — `dist`.
3. Environment: `VITE_API_URL` = backend manzili (oxirida `/api` **yozilmaydi**,
   uni `axios.ts` o'zi qo'shadi).
4. SPA routing uchun `vercel.json` allaqachon qo'shilgan.
