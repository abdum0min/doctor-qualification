# Qilingan ishlar va uztoz-rating bilan farqlar

Ushbu hujjat ikki savolga javob beradi: qanday ishlar bajarildi va bu platforma
`uztoz-rating` (ustoz reytingi) loyihasidan nimasi bilan farq qiladi.

---

## 1. Birinchi bosqich — sahifalash, reyting va tuzatishlar

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

## 2. Ikkinchi bosqich — uztoz-rating dagi yetishmayotgan modullar

### 2.1. Bildirishnomalar va e'lonlar

- `Notification` va `Announcement` modellari; `NotificationType`:
  `EXAM_PUBLISHED`, `CERTIFICATE_ISSUED`, `CERTIFICATE_REVOKED`, `SYSTEM`.
- Xabar avtomatik yoziladigan joylar: imtihon **nofaoldan faolga** o'tganda
  (o'sha yo'nalishdagi faol shifokorlarga), sertifikat berilganda (urinish
  tranzaksiyasi ichida — sertifikat yozilmasa xabar ham qolmaydi) va sertifikat
  bekor qilinganda.
- Xabar yozish hech qachon asosiy amaliyotni to'xtatmaydi: `NotificationsService`
  xatoni faqat jurnalga yozadi.
- Admin `/admin/announcements` da ommaviy xabar yuboradi. Auditoriya filtri
  (mutaxassislik, malaka darajasi) yuborishdan **oldin** nechta shifokor
  olishini ko'rsatadi. Xabar tarixi va bildirishnomalar bitta tranzaksiyada
  yoziladi, shuning uchun tarixdagi son har doim haqiqiy.
- Frontend: sarlavhadagi qo'ng'iroq (o'qilmaganlar nishoni bilan),
  `/notifications` sahifasi (Barchasi / O'qilmagan) va admin e'lonlar sahifasi.

Commit: `feat: add notifications and admin announcements`.

### 2.2. Global qidiruv

- `GET /search?q=&limit=` — imtihonlar, mutaxassisliklar, shifokorlar va
  sertifikatlar bo'yicha.
- Natija **rolga qarab toraytiriladi**: shifokor faqat faol imtihonlarni va
  **o'z** sertifikatlarini ko'radi, shifokorlar ro'yxati unga umuman ochilmaydi.
- Frontend: `Ctrl/⌘ + K` bilan ochiladigan buyruq oynasi. Har bir natija rolga
  mos sahifada ochiladi (sertifikat — ochiq tekshiruv sahifasida).

Commit: `feat: add global search`.

### 2.3. Savollarni CSV/Excel import qilish

- `POST /admin/exams/:examId/questions/import` — `.csv` va `.xlsx`.
- Ustunlar: `Savol | A | B | C | D | E | F | To'g'ri javob | Daraja`. Tartib
  muhim emas, `C`–`F` va `Daraja` ixtiyoriy; sarlavhalar o'zbekcha ham,
  inglizcha ham bo'lishi mumkin (apostrof va registr e'tiborga olinmaydi).
- Chegaralar formadagi bilan bir xil (matn 10–1000, variant ≤500, 2–6 variant,
  aynan bitta to'g'ri javob) — parser `question-import.parser.ts` da, 14 ta
  unit test bilan qoplangan.
- Fayl **avval to'liq tekshiriladi**, so'ng bitta tranzaksiyada yoziladi. Xato
  bo'lsa va "xatoli qatorlarni tashlab ketish" yoqilmagan bo'lsa — bazaga hech
  narsa yozilmaydi. Imtihonda allaqachon bor savollar takror deb tashlanadi.
- Frontend: import dialogi (natija xulosasi, qator raqami bilan xatolar jadvali,
  namuna CSV yuklab olish).

Commit: `feat: import exam questions from CSV and Excel`.

### 2.4. Platforma sozlamalari

- `PlatformSettings` — yagona qator: reyting vaznlari va hajm maqsadi,
  sertifikat amal qilish muddati, yangi imtihon uchun standart qiymatlar.
- Reyting bali endi sozlamadan olingan vaznlar bilan hisoblanadi
  (`calculateRankingScore(metrics, config)`); vaznlar yig'indisi 1 dan farq
  qilsa ham ball 0–100 shkalasida qoladi.
- Sertifikat muddati **berilgan paytdagi** sozlamadan olinadi va hujjatga
  yoziladi — sozlama keyin o'zgarsa ham eski sertifikat o'zgarmaydi.
- **Ataylab sozlamaga chiqarilmagan:** malaka darajasi chegaralari va sertifikat
  raqami formati. Ular berilgan hujjatlarga yozilgan va o'zgarmasligi kerak;
  sozlamalar sahifasida buni tushuntiruvchi izoh turadi.

Commit: `feat: add configurable platform settings`.

### 2.5. Shifokorning ommaviy profili

- `GET /doctors/:doctorId` — reyting va qidiruvdan ochiladi.
- **Email va telefon hech qachon qaytarilmaydi.** Bloklangan hisob profili 404.
- Ko'rsatiladi: ism, mutaxassislik, ish joyi, tajriba, qo'shilgan sana,
  yakunlangan urinishlar va o'tish ulushi, o'rtacha/eng yuqori ball, reytingdagi
  o'rni va **faqat amaldagi** sertifikatlar (har biri ochiq tekshiruvga havola).

Commit: `feat: add public doctor profile`.

### 2.6. Fayl yuklash (avatar)

- `POST /uploads/avatar`, `DELETE /uploads/avatar`.
- Fayl nomi **hech qachon mijozdan olinmaydi** — tasodifiy nom va MIME turidan
  kelib chiqqan kengaytma; faqat JPEG, PNG, WebP. SVG ataylab rad etiladi.
- Yangi rasm avval saqlanadi, keyin eskisi diskdan o'chiriladi — saqlash
  muvaffaqiyatsiz bo'lsa foydalanuvchi rasmsiz qolmaydi.
- Rasmlar `/uploads` ostida statik beriladi (`X-Content-Type-Options: nosniff`,
  CORP ochiq). Papka `.gitignore` ga qo'shilgan.
- Avatar sarlavhada, profil sahifasida va ommaviy profilda ko'rinadi; rasm yo'q
  bo'lsa ism bosh harflari chiqadi.

Commit: `feat: add avatar uploads`.

### 2.7. Demo ma'lumot va tekshiruv

- Seed endi bildirishnomalar va e'lonlarni ham yaratadi — qo'ng'iroq bo'sh
  ko'rinmaydi (`feat: seed demo notifications and announcements`).
- Backend: 46 jest testi, `typecheck`/`lint`/`build` toza.
- API smoke: 21 to'plam, ~570 tekshiruv.
- Brauzer (Playwright) e2e: 11 to'plam, 190 dan ortiq tekshiruv.
- Demo baza: 9 shifokor · 11 imtihon · 43 savol · 16 urinish · 12 sertifikat ·
  31 xabar · 3 e'lon.

---

## 3. `doctor-qualification` va `uztoz-rating` farqlari

Ikkala loyiha ham "foydalanuvchi test topshiradi → ball oladi → reytingga tushadi →
sertifikat oladi" oqimini quradi, lekin domeni va bir nechta qarorlari boshqacha.

### 3.1. Domen farqi

| | `uztoz-rating` | `doctor-qualification` |
| --- | --- | --- |
| Foydalanuvchi | O'qituvchi (teacher) | Shifokor (doctor) |
| Bo'lim | Fan (subject) | Mutaxassislik (specialty) |
| Test | `Test` | `Exam` |
| Natija ma'nosi | Reyting o'rni | **Malaka darajasi** (5 pog'ona) |

Eng katta konseptual farq: `uztoz-rating` da natija asosan **reyting** uchun, bu yerda
esa natija **malaka darajasini** belgilaydi va sertifikat shu darajani tasdiqlaydi.
Shuning uchun bu loyihada `domain/qualification.ts` markaziy o'rin egallaydi.

### 3.2. Bu loyihada ataylab boshqacha qilingan narsalar

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

### 3.3. `uztoz-rating` bilan modul solishtiruvi

| Imkoniyat | Holati |
| --- | --- |
| Bildirishnomalar / e'lonlar | ✅ qo'shildi (2.1) |
| Global qidiruv | ✅ qo'shildi (2.2) |
| Savollarni CSV/Excel import | ✅ qo'shildi (2.3) |
| Platforma sozlamalari | ✅ qo'shildi (2.4) |
| Ommaviy profil sahifasi | ✅ qo'shildi (2.5) |
| Fayl yuklash | ✅ qo'shildi (2.6) — hozircha faqat avatar |
| Hududlar ierarxiyasi | ❌ qo'shilmagan — `uztoz-rating` da viloyat → tuman → maktab zanjiri o'qituvchi profilining asosiy qismi. Tibbiyotda unga mos keladigan talab `req.txt` da yo'q, shuning uchun ataylab olinmadi. Kerak bo'lsa `DoctorProfile.workplace` matn maydonini muassasa jadvaliga almashtirish kifoya. |

### 3.4. Umumiy bo'lgan yondashuvlar

Ikkala loyihada ham: rol asosidagi `admin/*` marshrutlari, test ichidagi savol
boshqaruvi (`admin/tests/:testId/questions` ↔ `admin/exams/:examId/questions`),
reyting moduli, sertifikat moduli, bildirishnomalar, global qidiruv, savol importi,
platforma sozlamalari va alohida "Natijalar" sahifasi. Ikkinchi bosqichdagi ishlar
aynan shu tuzilishga yaqinlashtirish edi — chunki u amalda o'zini oqlagan.
