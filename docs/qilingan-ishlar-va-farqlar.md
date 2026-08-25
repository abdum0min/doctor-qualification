# Qilingan ishlar va uztoz-rating bilan farqlar

Ushbu hujjat ikki savolga javob beradi: oxirgi bosqichda nima qilindi va bu platforma
`uztoz-rating` (ustoz reytingi) loyihasidan nimasi bilan farq qiladi.

---

## 1. Oxirgi bosqichda qilingan ishlar

### 1.1. Sahifalash: cursor → `page` / `limit` / `total`

Avval ro'yxatlar faqat "oldinga / orqaga" tugmalari bilan ishlar edi — foydalanuvchi
nechta sahifa borligini bilmasdi va to'g'ridan-to'g'ri 7-sahifaga o'ta olmasdi.

- `CursorQueryDto` va `cursor.util.ts` o'chirildi, o'rniga `PageQueryDto`
  (`page`, `limit`, `search`, `sortOrder`) va `pagination.util.ts` keldi
  (`toSkipTake`, `buildPaginated`).
- Barcha ro'yxat endpointlari bir xil `meta` qaytaradi:
  `{ page, limit, total, totalPages }`.
- Frontendda `useTableQuery` qayta yozildi (`page`, `setPage`, `resetPage`),
  `TablePagination` esa raqamli sahifalar, `…` bo'shliqlari va
  "`{total}` tadan `{from}`–`{to}` ko'rsatilmoqda" satrini chizadi.
- Eski `?cursor=` parametri endi `400` bilan rad etiladi — jim qolib noto'g'ri natija
  bermasligi uchun.

Commit: `refactor: switch lists to page-based pagination`.

### 1.2. Savollar imtihon ichiga ko'chirildi

Muammo: imtihon yaratish mumkin edi, lekin unga savol biriktirib bo'lmasdi — savollar
mutaxassislikka bog'langan edi, imtihonga emas.

Yangi ierarxiya: **Mutaxassislik → Imtihon → Savol → Variant**.

- `Question.specialtyId` → `Question.examId` (+ `position`,
  `@@unique([examId, position])`).
- `Exam.difficulty` olib tashlandi — daraja endi savol darajasi orqali ifodalanadi.
- Ma'lumot yo'qotmaydigan qo'lda yozilgan migratsiya
  (`20260825174505_attach_questions_to_exams`): har bir savol o'z mutaxassisligining
  eng eski imtihoniga ko'chirildi, pozitsiyalar oyna funksiyasi bilan qayta raqamlandi,
  `Exam.questionCount` real songa moslandi, savolsiz imtihonlar nofaol qilindi.
  Mavjud 64 urinish va 14 sertifikat butunligicha saqlandi.
- API: `/questions` → `/admin/exams/:examId/questions`.
- Alohida "Savollar" sahifasi o'chirildi; o'rniga imtihon ichidagi
  `admin-exam-questions-page.tsx` — "Imtihonlarga qaytish" havolasi va savol
  yetishmasa ogohlantirish bilan.
- Yangi qo'riqchi: `ensureExamStaysSatisfiable` — savolni o'chirish yoki nofaol qilish
  imtihonni "boshlab bo'lmaydigan" holatga tushirsa, xato qaysi imtihon bloklayotganini
  nomi bilan aytadi.

Commit: `refactor: manage questions inside their exam`.

### 1.3. Shifokorlar reytingi

- `backend/src/domain/ranking.ts` — reyting bali bitta joyda: o'rtacha natija **50%**,
  eng yuqori natija **20%**, urinishlar hajmi **20%**, o'tish ulushi **10%**.
  Faqat o'rtacha ball bilan tartiblasak, bitta 100% olgan shifokor o'nta 95% olgandan
  yuqori chiqib qolardi — bu adolatsiz.
- `GET /rankings` (filtrlar: mutaxassislik, davr — `all|month|quarter|year`, qidiruv),
  `GET /rankings/top`, `GET /rankings/me` (faqat shifokor).
- Bitta `ranking-page.tsx` ikkala rol uchun ishlaydi: `/ranking` (shifokor) va
  `/admin/rankings`. "Mening o'rnim" kartasi adminda ko'rsatilmaydi.

Commit: `feat: add doctor rankings`.

### 1.4. Shifokor uchun "Natijalarim" sahifasi

Statistik kartalar (urinishlar, o'rtacha va eng yuqori ball, o'tganlar soni) +
imtihon va status bo'yicha filtrlanadigan urinishlar jadvali. Filtr o'zgarganda
sahifalash `key` orqali qayta boshlanadi, shuning uchun "3-sahifa, ammo natija yo'q"
holati chiqmaydi.

Commit: `feat: add doctor results page`.

### 1.5. Tuzatilgan buglar

**Sidebar.** `NavLink` prefiks bo'yicha moslashardi, shuning uchun `/admin/doctors`
sahifasida ham "Boshqaruv paneli" faol ko'rinardi. Endi mos keluvchi elementlar ichidan
**eng uzun** yo'l tanlanadi (`activeNavItem`), va bu ham yon menyu, ham sarlavha uchun
ishlatiladi.

**Navbar.** Bosh sahifa `ProtectedRoute` dan tashqarida bo'lgani uchun sessiya do'koni
bo'sh edi va tizimga kirgan foydalanuvchi ham "Kirish / Ro'yxatdan o'tish" tugmalarini
ko'rardi. Endi `public-layout.tsx` `useSession()` ni chaqiradi, yuklanish paytida
skelet ko'rsatadi (tugma "sakramasligi" uchun) va rolga qarab "Boshqaruv paneli" yoki
"Kabinetim" tugmasini chizadi.

Commit: `fix: correct sidebar active state and header session actions`.

### 1.6. Sertifikat PDF va demo ma'lumot

- Admin ham PDF yuklab oladi: `findOwnByCertificateId` → `findForDownload`, admin uchun
  egalik filtri qo'llanmaydi, shifokor uchun esa avvalgidek faqat o'ziniki.
- Yangi seed: `demo-doctors.ts` (8 ta shifokor + urinish rejalari) va
  `attempts.seeder.ts` — urinishlar to'liq nusxa (snapshot) bilan yaratiladi, o'sha
  domen funksiyalari (`calculateScore`, `qualificationForScore`) bilan baholanadi va
  sertifikatlar `certificate_number_seq` orqali beriladi. Endi "Natijalar", "Reyting"
  va "Sertifikatlar" bo'limlari bo'sh emas — PDF tugmasi darhol ko'rinadi.
- **Sertifikat raqami formati o'zgartirilmadi** (`DOC-2026-000123`) — `req.txt` dagi
  talab shunday.

Commit: `feat: add admin certificate download and demo dataset`.

### 1.7. Tekshiruv

- Backend: `typecheck`, `lint`, `build` toza; **28** jest testi.
- API smoke: 15 to'plam, ~380 tekshiruv (auth, specialties, exams, exam-questions,
  attempts, evaluation, dashboard, pagination, certificates, verification, admin,
  rankings, results, security, admin-pdf) — barchasi yashil.
- Brauzer (Playwright/Chromium) e2e: 16/16, bug tuzatishlari uchun alohida 26/26.
- Demo baza smoke-test qoldiqlaridan tozalandi:
  9 shifokor · 12 imtihon · 44 savol · 15 urinish · 11 sertifikat.

---

## 2. `doctor-qualification` va `uztoz-rating` farqlari

Ikkala loyiha ham "foydalanuvchi test topshiradi → ball oladi → reytingga tushadi →
sertifikat oladi" oqimini quradi, lekin domeni va bir nechta qarorlari boshqacha.

### 2.1. Domen farqi

| | `uztoz-rating` | `doctor-qualification` |
| --- | --- | --- |
| Foydalanuvchi | O'qituvchi (teacher) | Shifokor (doctor) |
| Bo'lim | Fan (subject) | Mutaxassislik (specialty) |
| Test | `Test` | `Exam` |
| Natija ma'nosi | Reyting o'rni | **Malaka darajasi** (5 pog'ona) |

Eng katta konseptual farq: `uztoz-rating` da natija asosan **reyting** uchun, bu yerda
esa natija **malaka darajasini** belgilaydi va sertifikat shu darajani tasdiqlaydi.
Shuning uchun bu loyihada `domain/qualification.ts` markaziy o'rin egallaydi.

### 2.2. Bu loyihada ataylab boshqacha qilingan narsalar

- **Sertifikat raqami** — `req.txt` talabi bo'yicha ketma-ket format
  `DOC-YYYY-NNNNNN`, Postgres ketma-ketligidan (`certificate_number_seq`).
  `uztoz-rating` da boshqa sxema ishlatilgan; biz mijoz so'ragan formatni saqladik.
- **PDF backendda** — `pdfkit` + `qrcode`, headless brauzersiz. Deploy yengil bo'ladi.
- **Snapshot tarixi** — `AttemptQuestion` / `AttemptOption`. Savol keyin tahrirlansa
  yoki o'chirilsa ham eski natija va uning tahlili o'zgarmaydi. Bu sertifikat beruvchi
  tizim uchun majburiy: sertifikat orqasidagi dalil o'zgarmasligi kerak.
- **Prisma global `omit`** — `user.password`, `questionOption.isCorrect`,
  `attemptOption.isCorrect` ORM darajasida yopilgan. E'tibordan chetda qolgan `include`
  ham to'g'ri javobni tashqariga chiqara olmaydi.
- **Ochiq sertifikat tekshiruvi** — Certificate ID yoki QR kod orqali, tizimga
  kirmasdan. Sertifikat muddati va bekor qilish (`revoke`) ham bor.
- **Ochiq landing sahifasi** va ochiq statistika.

### 2.3. `uztoz-rating` da bor, bu yerda hali yo'q

Bu — kelajakdagi ish ro'yxati (bildirishnoma va global qidiruv "oxirgi ish" deb
kelishilgan):

| Imkoniyat | `uztoz-rating` dagi holati | Izoh |
| --- | --- | --- |
| Bildirishnomalar / e'lonlar | `notifications` moduli, `admin/announcements`, `notifications-page.tsx` | Rejalashtirilgan, oxirgi navbatda |
| Global qidiruv | `search` moduli | Rejalashtirilgan, oxirgi navbatda |
| Savollarni CSV/Excel import | `modules/questions/import` | Katta savol bazasi uchun foydali |
| Platforma sozlamalari | `settings` moduli + `admin-settings-page.tsx` | Hozircha sozlamalar `.env` va imtihon darajasida |
| Fayl yuklash | `uploads` moduli | Avatar / ilova fayllari uchun |
| Hududlar ierarxiyasi | `locations` moduli (viloyat → tuman → maktab) | Tibbiyotda muassasa ierarxiyasi kerak bo'lsa qo'shiladi |
| Ommaviy profil sahifasi | `teacher-profile-page.tsx` | Shifokor profili hozircha faqat o'ziga ko'rinadi |

### 2.4. Umumiy bo'lgan yondashuvlar

Ikkala loyihada ham: rol asosidagi `admin/*` marshrutlari, test ichidagi savol
boshqaruvi (`admin/tests/:testId/questions` ↔ `admin/exams/:examId/questions`),
reyting moduli, sertifikat moduli va alohida "Natijalar" sahifasi. Oxirgi bosqichdagi
ishlarning bir qismi aynan shu tuzilishga yaqinlashtirish edi — chunki u amalda
o'zini oqlagan.
