# Doctor Qualification — Backend

NestJS 11 + Prisma 7 + PostgreSQL (Neon). Shifokorlarning malakasini baholovchi
platformaning API qismi: autentifikatsiya, savol bazasi, imtihon dvigateli,
server tomonidagi baholash va sertifikat (PDF + QR) generatsiyasi.

Loyiha haqida umumiy ma'lumot uchun ildizdagi [`README.md`](../README.md) ga qarang.

---

## Infratuzilma

| Qism | Tafsilot |
| --- | --- |
| **Auth** | Register / Login / Me / Logout, JWT (Passport), bcrypt, role-based guard |
| **Global response** | Har bir javob bir xil konvertda: `{ success, statusCode, message, data, meta?, timestamp, path }` |
| **Global error** | `AllExceptionsFilter` — HTTP, Prisma (P2002/P2025/P2003/…) va kutilmagan xatolarni bir xil formatga keltiradi |
| **Validation** | Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) + DTO'larda `class-validator` |
| **ENV** | Ilova ko'tarilishidan oldin `class-validator` bilan tekshiriladi — noto'g'ri ENV bo'lsa process ishga tushmaydi |
| **Prisma** | `PrismaPg` adapter, Neon/Supabase pooler bilan ishlaydi, connection pool sozlangan, `password` global `omit` |
| **Swagger** | `/api/docs`, bearer auth saqlanadi, javob konverti to'g'ri hujjatlashtirilgan |
| **Rate limit** | `@nestjs/throttler` global + login/register uchun qattiqroq limit |
| **Security** | `helmet`, CORS oq ro'yxati |
| **Health** | `GET /api/health` — deploy platformalari uchun probe (bazaga ping bilan) |
| **Pagination** | Kursorli paginatsiya util'lari (`CursorQueryDto`, `buildCursorPaginated`) |
| **Logging** | Har bir so'rov uchun `METHOD /url status - Xms` |

---

## Papka tuzilishi

```
src/
├── common/                    # butun ilovaga umumiy, domenga bog'liq emas
│   ├── decorators/            # @Public, @Roles, @CurrentUser, @ResponseMessage
│   ├── dto/                   # CursorQueryDto (limit, search, sortBy, cursor)
│   ├── filters/               # AllExceptionsFilter
│   ├── guards/                # JwtAuthGuard, RolesGuard
│   ├── interceptors/          # ResponseInterceptor
│   ├── interfaces/            # ApiSuccessResponse, ApiErrorResponse
│   ├── middleware/            # LoggerMiddleware
│   ├── swagger/               # javob konvertini hujjatlash dekoratorlari
│   ├── types/                 # AuthenticatedUser
│   └── utils/                 # cursor encode/decode, buildCursorPaginated
├── config/
│   └── env.validation.ts      # ENV sxemasi (yangi ENV shu yerga qo'shiladi)
├── modules/
│   ├── auth/                  # register, login, me, logout
│   ├── health/                # GET /api/health
│   └── prisma/                # global PrismaService
├── generated/prisma/          # Prisma client (git'ga tushmaydi)
├── app.module.ts
└── main.ts
```

---

## Ishga tushirish

```bash
npm install                 # postinstall'da `prisma generate` avtomatik ishlaydi
cp .env.example .env        # keyin .env ichini to'ldiring
npm run db:deploy           # migration'larni bazaga qo'llaydi
npm run db:seed             # ixtiyoriy: demo foydalanuvchilar
npm run start:dev
```

- API — <http://localhost:3000/api>
- Swagger — <http://localhost:3000/api/docs>
- Health — <http://localhost:3000/api/health>

Seed'dan keyingi hisoblar: `admin@example.com / Admin123` va `user@example.com / User1234`.

### Neon (yoki boshqa cloud Postgres)

Neon ikkita connection string beradi va **ikkalasi ham kerak**:

| ENV | Qaysi host | Nima uchun |
| --- | --- | --- |
| `DATABASE_URL` | `-pooler` **bilan** | Runtime. Serverless/pooled ulanish, ko'p ulanishni ko'taradi |
| `DIRECT_URL` | `-pooler` **siz** | `prisma migrate` va `seed`. Pooler orqali migration ishlamaydi |

`prisma.config.ts` migration uchun avtomatik `DIRECT_URL`ni oladi, ilovaning
o'zi esa `DATABASE_URL` bilan ishlaydi.

---

## Skriptlar

| Buyruq | Vazifasi |
| --- | --- |
| `npm run start:dev` | Watch rejimida ishga tushirish |
| `npm run build` / `npm start` | Production build va ishga tushirish |
| `npm run typecheck` | TypeScript tekshiruvi (emit'siz) |
| `npm run lint` | ESLint + avtomatik tuzatish |
| `npm run db:migrate` | Yangi migration yaratish (dev) |
| `npm run db:deploy` | Mavjud migration'larni qo'llash (prod) |
| `npm run db:generate` | Prisma client'ni qayta generatsiya qilish |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Seed |

---

## Yangi modul qo'shish tartibi

1. `prisma/schema.prisma`ga model qo'shing → `npm run db:migrate`.
2. `src/modules/<nom>/` papkasini yarating: `*.module.ts`, `*.controller.ts`,
   `*.service.ts`, `dto/`.
3. DTO'larda `class-validator` + `@ApiProperty` ishlating.
4. Controller'da:
   - ochiq endpoint bo'lsa — `@Public()`;
   - faqat admin uchun bo'lsa — `@Roles(UserRole.ADMIN)`;
   - javob matni uchun — `@ResponseMessage('...')`;
   - Swagger uchun — `@ApiDataResponse(Dto)` / `@ApiPaginatedResponse(Dto)` /
     `@ApiErrorResponses(400, 404)`.
5. Ro'yxat qaytaruvchi endpoint'da `CursorQueryDto` + `buildCursorPaginated()`
   ishlating — `ResponseInterceptor` `meta`ni o'zi ajratib qo'yadi.
6. Modulni `app.module.ts` → `imports` ga qo'shing.

### Namuna

```ts
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiBearerAuth('access-token')
  @ResponseMessage('Posts list')
  @ApiPaginatedResponse(PostDto)
  findAll(@Query() query: QueryPostsDto) {
    return this.postsService.findAll(query); // { items, meta } qaytaradi
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Post created')
  @ApiDataResponse(PostDto, { status: 201 })
  @ApiErrorResponses(400, 403)
  create(@Body() dto: CreatePostDto, @CurrentUser('id') userId: number) {
    return this.postsService.create(dto, userId);
  }
}
```

---

## Javob formati

Muvaffaqiyatli:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": { "accessToken": "...", "user": { "id": 1 } },
  "timestamp": "2026-01-01T10:00:00.000Z",
  "path": "/api/auth/login"
}
```

Ro'yxat (kursorli paginatsiya) — qo'shimcha `meta`:

```json
{
  "success": true,
  "data": [{ "id": 1 }],
  "meta": { "limit": 10, "nextCursor": "eyJpZCI6MTB9", "hasMore": true }
}
```

Xato:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["email must be an email"],
  "timestamp": "2026-01-01T10:00:00.000Z",
  "path": "/api/auth/register"
}
```

---

## Deploy

1. Platformada ENV'larni to'ldiring (`.env.example` bo'yicha), `NODE_ENV=production`
   va `CORS_ORIGIN`ga frontend domenini yozing.
2. Build: `npm install && npm run build` (`postinstall` Prisma client'ni yasaydi).
3. Migration: deploy oldidan `npm run db:deploy`.
4. Start: `npm start`.
5. Health probe: `/api/health`.

> Doimiy ishlovchi Node process (Render, Railway, Fly) tavsiya qilinadi —
> NestJS + Prisma uchun eng sodda yo'l.
