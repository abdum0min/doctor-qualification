# Vercel'ga deploy qilish

Loyiha **ikkita alohida Vercel proyekti** sifatida chiqadi: backend (serverless
funksiya) va frontend (statik SPA). Ular bir-birini domen orqali topadi.

```
doctor-qualification-api   →  backend/    NestJS serverless funksiya
doctor-qualification       →  frontend/   Vite statik build
```

---

## 1. Baza (Neon) — birinchi bo'lib

Vercel'da hech narsa qilishdan oldin Neon'da baza tayyor bo'lishi kerak.

Neon konsolidan **ikkita** ulanish satrini oling:

| Nima | Qayerda ishlatiladi | Hostda nima bor |
| --- | --- | --- |
| **Pooled** | Runtime (`DATABASE_URL`) | `-pooler` bo'g'ini bor |
| **Direct** | Migratsiya va seed (`DIRECT_URL`) | `-pooler` **yo'q** |

Migratsiyalar lokal mashinadan qo'llanadi — Vercel build'i bazani
o'zgartirmaydi (bu ataylab: deploy paytida sxema o'zgarishi xavfli):

```bash
cd backend
# .env da DIRECT_URL production bazasiga qarab tursin
npm run db:deploy     # migratsiyalarni qo'llash
npm run db:seed       # demo ma'lumot (ixtiyoriy, faqat birinchi marta)
```

> Production bazaga seed qilishdan oldin o'ylang: u demo hisoblarni ochiq
> parollar bilan yaratadi.

---

## 2. Backend proyekti

**Vercel → Add New → Project → repo'ni tanlang.**

| Sozlama | Qiymat |
| --- | --- |
| Root Directory | `backend` |
| Framework Preset | `Other` |
| Build / Install / Output | tegmang — `backend/vercel.json` da yozilgan |

`backend/vercel.json` nima qiladi:

- `installCommand: npm ci --include=dev` — `nest build` uchun dev-bog'liqliklar
  kerak, Vercel esa productionda ularni tashlab ketardi.
- `buildCommand: prisma generate && nest build` — generatsiya qilingan Prisma
  mijozi git'ga tushmaydi, shuning uchun har build'da qayta yaratiladi.
- `includeFiles: {dist/**,node_modules/pdfkit/js/data/**}` — `dist` funksiya
  ichiga kiradi; `pdfkit` shrift metrikalari (`.afm`) esa dinamik yo'l orqali
  o'qilgani uchun Vercel fayl kuzatuvchisi ularni o'tkazib yuboradi va
  sertifikat PDF'i ishlamay qolardi.
- `rewrites` — barcha so'rovlar bitta `api/index.js` funksiyasiga boradi.

### Backend environment variables

Vercel → Project → Settings → Environment Variables. Barchasini
**Production** (kerak bo'lsa Preview ham) uchun qo'ying.

| O'zgaruvchi | Qiymat | Majburiy |
| --- | --- | --- |
| `NODE_ENV` | `production` | ✅ |
| `DATABASE_URL` | Neon **pooled** satri (`-pooler` bilan) | ✅ |
| `JWT_SECRET` | kamida 32 belgi tasodifiy satr | ✅ |
| `CORS_ORIGIN` | frontend domeni, masalan `https://doctor-qualification.vercel.app` | ✅ |
| `PUBLIC_APP_URL` | frontend domeni (sertifikat QR kodi shu yerga ishora qiladi) | ✅ |
| `API_PREFIX` | `api` | ⬜ standart |
| `APP_NAME` | `Doctor Qualification API` | ⬜ standart |
| `JWT_EXPIRES_IN` | `1d` | ⬜ standart |
| `THROTTLE_TTL` | `60000` | ⬜ standart |
| `THROTTLE_LIMIT` | `120` | ⬜ standart |
| `SWAGGER_ENABLED` | `false` — productionda standart holat | ⬜ |
| `DIRECT_URL` | **kerak emas** — faqat lokal migratsiya uchun | ⬜ |
| `PORT` | **qo'ymang** — Vercel o'zi boshqaradi | ⬜ |
| `UPLOAD_DIR`, `MAX_UPLOAD_SIZE_MB` | **kerak emas** — 4-bo'limga qarang | ⬜ |

`JWT_SECRET` generatsiyasi:

```bash
openssl rand -base64 48
```

> `CORS_ORIGIN` bir nechta domenni qabul qiladi, vergul bilan:
> `https://doctor-qualification.vercel.app,https://malaka.uz`
> Bo'sh joy qo'ysangiz ham bo'ladi — u kesib tashlanadi.

### Tekshirish

```bash
curl https://doctor-qualification-api.vercel.app/api/health
```

Kutilgan javob:

```json
{ "success": true, "data": { "status": "ok", "database": "up" } }
```

Agar `500` qaytsa, javob ichida `env` bo'limi bo'ladi va qaysi o'zgaruvchi
`missing` ekanini ko'rsatadi — `api/index.js` shuning uchun shunday yozilgan.

---

## 3. Frontend proyekti

**Yana Add New → Project → o'sha repo.**

| Sozlama | Qiymat |
| --- | --- |
| Root Directory | `frontend` |
| Framework Preset | `Vite` (avtomatik aniqlanadi) |

`frontend/vercel.json` dagi `rewrites` — SPA uchun: `/verify/DOC-2026-000123`
kabi ichki manzillar to'g'ridan-to'g'ri ochilganda 404 bermasligi uchun barcha
so'rovlar `index.html` ga yo'naltiriladi.

### Frontend environment variables

| O'zgaruvchi | Qiymat | Izoh |
| --- | --- | --- |
| `VITE_API_URL` | `https://doctor-qualification-api.vercel.app` | **Oxirida `/api` BO'LMASIN** — mijoz uni o'zi qo'shadi |

> Vite o'zgaruvchilarni **build paytida** kodga yozadi. `VITE_API_URL` ni
> o'zgartirsangiz, qayta deploy qilish shart — Vercel'da o'zgaruvchini
> saqlash yetarli emas.

---

## 4. Nima ishlamaydi va nega

### Fayl yuklash (avatar)

Vercel serverless'da fayl tizimi **vaqtinchalik**: yozilgan fayl keyingi
so'rovda yo'q bo'ladi va instansiyalar orasida bo'linmaydi.

Shuning uchun `UploadsService` u yerda o'zini o'chiradi va `503` qaytaradi:

```json
{
  "statusCode": 503,
  "message": "File uploads need persistent storage and are disabled in this deployment"
}
```

Bu ataylab: rasm yozilgandek ko'rinib, keyin yo'qolib ketishidan ko'ra ochiq
xato yaxshiroq. Avatar kerak bo'lsa — S3, Cloudflare R2 yoki Vercel Blob
ulanadi; `UploadsService` da faqat `saveImage`/`removeByUrl` almashadi.

### Sovuq start

Birinchi so'rov 2–4 soniya olishi mumkin (Nest ko'tariladi + Neon uyg'onadi).
Keyingilari tez. `api/index.js` ilovani modul darajasida keshlaydi, shuning
uchun bitta instansiya qayta ishlatilganda u qaytadan ko'tarilmaydi.

Neon "scale to zero" ni o'chirib qo'ysangiz, sovuq start sezilarli qisqaradi.

### Ulanishlar hovuzi

Serverless'da har bir instansiya alohida jarayon. `DB_POOL_SIZE` shuning uchun
u yerda **1** ga tushadi (`src/config/runtime.ts`) — aks holda o'nlab
instansiya Neon ulanishlarini tez tugatib qo'yardi. Pooled URL ishlatish ham
shu sababdan majburiy.

---

## 5. Deploydan keyingi ro'yxat

- [ ] `GET /api/health` → `database: "up"`
- [ ] Frontend ochiladi, `/login` da kirish ishlaydi
- [ ] Brauzer konsolida CORS xatosi yo'q
- [ ] Sertifikatni PDF qilib yuklab olish ishlaydi (pdfkit shriftlari joyida)
- [ ] `/verify/DOC-...` to'g'ridan-to'g'ri ochilganda 404 bermaydi
- [ ] `/api/docs` yopiq (`SWAGGER_ENABLED` qo'yilmagan bo'lsa)
