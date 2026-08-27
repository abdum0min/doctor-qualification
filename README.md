# Doctor Qualification

Shifokorlarning kasbiy bilimi va malaka darajasini onlayn testlar orqali baholovchi
platforma. Shifokor mutaxassisligini tanlaydi, imtihon topshiradi, natijasiga qarab
malaka darajasini oladi va muvaffaqiyatli natijada elektron sertifikat beriladi.
Sertifikat haqiqiyligini Certificate ID yoki QR kod orqali istalgan kishi — tizimga
kirmasdan — tekshirishi mumkin.

```
backend/    NestJS 11 + Prisma 7 + PostgreSQL (Neon)
frontend/   React 19 + Vite + Tailwind v4 + shadcn/ui
```

---

## Asosiy imkoniyatlar

| Rol | Imkoniyatlar |
| --- | --- |
| **Shifokor** | Ro'yxatdan o'tish, profil va rasm, imtihon topshirish (taymer, avtosaqlash, davom ettirish), natijalarim sahifasi va javoblar tahlili, shifokorlar reytingi va ommaviy profil, bildirishnomalar, global qidiruv, sertifikat va uni PDF sifatida yuklab olish |
| **Administrator** | Statistika paneli, shifokorlar boshqaruvi, mutaxassisliklar, imtihonlar va ularning savollari (qo'lda yoki CSV/Excel import), natijalar, reyting, e'lonlar, platforma sozlamalari, sertifikatlarni yuklab olish va bekor qilish |
| **Ochiq (auth talab qilinmaydi)** | Bosh sahifa, mutaxassisliklar va imtihonlar ro'yxati, platforma statistikasi, sertifikatni tekshirish |

## Muhim qoidalar

**Natija faqat serverda hisoblanadi.** Mijoz yuborgan `score`, `passed`,
`correctCount` yoki `qualification` hech qachon qabul qilinmaydi — `AttemptEvaluator`
natijani urinish nusxasidagi ma'lumotdan chiqaradi.

**To'g'ri javob imtihon davomida yuborilmaydi.** `isCorrect` ustuni Prisma darajasida
global `omit` bilan yopilgan, shuning uchun e'tibordan chetda qolgan `include` ham uni
tashqariga chiqara olmaydi. Javoblar faqat urinish yakunlangandan keyin ochiladi.

**Tarixiy natija o'zgarmaydi.** Urinish boshlanganda savol matni, variantlari va
sozlama qiymatlari (savollar soni, vaqt, o'tish bali) nusxalanadi. Savol keyin
tahrirlansa yoki o'chirilsa ham eski natija va uning tahlili o'zgarmaydi.

**Savollar imtihonga tegishli.** Ierarxiya: `Mutaxassislik → Imtihon → Savol → Variant`.
Admin imtihonni yaratadi, so'ng uning ichiga savollarni biriktiradi; har bir urinishda
shu to'plamdan belgilangan miqdori tasodifiy tanlanadi.

**Malaka darajasi bitta joyda belgilanadi** — `backend/src/domain/qualification.ts`:

| Natija | Daraja |
| --- | --- |
| 0–49% | Boshlang'ich |
| 50–69% | O'rta |
| 70–84% | Yaxshi |
| 85–94% | Yuqori |
| 95–100% | Ekspert |

**Reyting bali** — `backend/src/domain/ranking.ts`: o'rtacha natija (50%),
eng yuqori natija (20%), urinishlar hajmi (20%) va o'tish ulushi (10%)
vaznli o'rtachasi. Faqat o'rtacha ball bilan tartiblash adolatsiz bo'lardi.
Vaznlar administrator sozlamalaridan olinadi (`/admin/settings`).

**Sozlamaga chiqarilmagan narsalar.** Malaka darajasi chegaralari va sertifikat
raqami formati (`DOC-YYYY-NNNNNN`) berilgan hujjatlarga yozilgan — ular
o'zgarmaydi. Sertifikat muddatini o'zgartirish esa faqat yangi beriladigan
hujjatlarga ta'sir qiladi.

---

## Ishga tushirish

Talab: Node.js 20+ va Neon (yoki boshqa cloud) PostgreSQL bazasi.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # DATABASE_URL, DIRECT_URL, JWT_SECRET to'ldiriladi
npm run db:deploy         # migratsiyalarni qo'llash
npm run db:seed           # demo ma'lumotlar
npm run start:dev
```

API: `http://localhost:3000/api` · Swagger: `http://localhost:3000/api/docs`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL
npm run dev
```

Ilova: `http://localhost:5173`

### Demo hisoblar

Seed mutaxassisliklar, imtihonlar va ularning savollarini, shuningdek natijalar,
reyting, sertifikatlar va bildirishnomalar bo'sh ko'rinmasligi uchun demo
shifokorlarni tugallangan urinishlari va e'lonlari bilan yaratadi.

Quyidagi hisoblar tayyor turadi (faqat lokal ishlash uchun):

| Rol | Email | Parol |
| --- | --- | --- |
| ADMIN | `admin@doctorqualification.uz` | `Admin123` |
| DOCTOR | `doctor@doctorqualification.uz` | `Doctor123` |
| DOCTOR | `nilufar.karimova@doctorqualification.uz` | `Doctor123` |

> **Diqqat:** seed ichidagi savollar — faqat platformani sinab ko'rish uchun
> yaratilgan **namuna** kontent. Ular rasmiy klinik ko'rsatmalar yoki attestatsiya
> savollari emas va tibbiy qaror uchun asos bo'la olmaydi.

---

## Hujjatlar

| Fayl | Nima haqida |
| --- | --- |
| [docs/qilingan-ishlar.md](docs/qilingan-ishlar.md) | Bosqichma-bosqich bajarilgan ishlar |
| [docs/uztoz-rating-farqlari.md](docs/uztoz-rating-farqlari.md) | `uztoz-rating` bilan farqlar |
| [docs/vercel-deploy.md](docs/vercel-deploy.md) | Vercel'ga deploy va environment o'zgaruvchilari |

---

## Environment

| O'zgaruvchi | Tavsif |
| --- | --- |
| `DATABASE_URL` | Runtime uchun **pooled** ulanish (Neon'da host nomida `-pooler`) |
| `DIRECT_URL` | Migratsiya va seed uchun to'g'ridan-to'g'ri ulanish |
| `JWT_SECRET` | Kamida 32 belgi |
| `CORS_ORIGIN` | Vergul bilan ajratilgan ro'yxat |
| `PUBLIC_APP_URL` | Sertifikat QR kodi shu manzilga ishora qiladi |
| `SWAGGER_ENABLED` | Bo'sh bo'lsa: dev'da yoqilgan, productionda o'chirilgan |
| `UPLOAD_DIR` | Yuklangan rasmlar papkasi (standart `uploads`) |
| `MAX_UPLOAD_SIZE_MB` | Bitta rasm uchun chegara (standart 5) |
| `VITE_API_URL` | Frontend uchun backend manzili |

`.env` git'ga tushmaydi. Yangi o'zgaruvchi qo'shsangiz avval
`backend/src/config/env.validation.ts` ga, keyin `.env.example` ga qo'shing —
noto'g'ri konfiguratsiyada ilova umuman ko'tarilmaydi.

Production uchun to'liq ro'yxat va Vercel sozlamalari:
[docs/vercel-deploy.md](docs/vercel-deploy.md).

---

## Tekshiruv

```bash
# backend
npm run typecheck && npm run lint && npm test && npm run build

# frontend
npx tsc -b && npm run lint && npm run build
```

## API bo'limlari

```
/auth                            ro'yxatdan o'tish, kirish, joriy foydalanuvchi
/doctors                         shifokor profili va boshqaruv paneli xulosasi
/specialties                     mutaxassisliklar (ochiq ro'yxat + admin CRUD)
/exams                           imtihon sozlamalari (ochiq ro'yxat + admin CRUD)
/admin/exams/:id/questions       imtihon savollari (faqat admin)
/admin/exams/:id/questions/import CSV yoki Excel fayldan import
/attempts                        imtihon urinishlari (faqat shifokorning o'ziniki)
/certificates                    sertifikatlar, PDF yuklab olish, ochiq tekshirish
/rankings                        shifokorlar reytingi (filtrlar bilan)
/doctors/:id                     shifokorning ommaviy profili
/notifications                   bildirishnomalar va ularni o'qilgan deb belgilash
/search                          global qidiruv (rolga qarab toraytiriladi)
/uploads/avatar                  profil rasmi
/statistics                      ochiq va admin statistikasi
/admin/doctors, /admin/attempts  shifokorlar va natijalar boshqaruvi
/admin/announcements             ommaviy xabar yuborish va tarixi
/admin/settings                  platforma sozlamalari
```

Barcha ro'yxatlar bir xil sahifalash konvertini qaytaradi:
`meta: { page, limit, total, totalPages }`.
