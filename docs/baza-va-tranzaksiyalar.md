# Baza bilan ishlash va tranzaksiyalar

Bu hujjat ikki savolga javob beradi: **P2028** xatosi nima edi va bu loyihada
baza bilan umuman qanday ishlanadi.

---

## 1. P2028 nima edi

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Database request failed (P2028)",
  "path": "/api/attempts"
}
```

Backend logidagi to'liq matn:

```
Transaction API error: A batch query cannot be executed on an expired transaction.
The timeout for this transaction was 5000 ms, however 5445 ms passed since the
start of the transaction.
```

`P2028` — Prisma'ning **tranzaksiya xatosi** kodi. Bu baza yiqilgani yoki
ma'lumot noto'g'ri ekani emas: **tranzaksiya juda uzoq ochiq turgani** uchun
Prisma uni o'zi uzib tashlagan.

### Nima uchun sodir bo'lgan

Imtihonni yakunlash `finalize()` da bitta tranzaksiyada bajarilardi:

```
tranzaksiya boshlandi
  ├─ urinish nusxasini o'qish                    1 aylanma
  ├─ har bir savol uchun alohida UPDATE          N aylanma   ← muammo shu yerda
  ├─ urinish natijasini yozish                   1 aylanma
  └─ sertifikat:
       ├─ mavjudligini tekshirish                1
       ├─ imtihon/shifokor nomlarini o'qish      1
       ├─ nextval('certificate_number_seq')      1
       ├─ sozlamalardan amal qilish muddati      1
       ├─ sertifikat yozish                      1
       └─ bildirishnoma yozish                   1
tranzaksiya yopildi
```

Ikkita narsa qo'shilib xatoga olib kelgan:

**1) `Promise.all` tranzaksiya ichida parallel ishlamaydi.** Kod shunday edi:

```ts
await Promise.all(
  result.gradedQuestions.map((question) =>
    tx.attemptQuestion.update({ where: { id: question.id }, ... }),
  ),
);
```

Ko'rinishidan parallel, lekin tranzaksiya **bitta ulanishda** bajariladi —
Postgres bitta ulanishda so'rovlarni navbat bilan o'qiydi. Ya'ni 40 ta savol =
40 ta ketma-ket aylanma.

**2) Baza uzoqda.** Neon'ga bitta aylanma ~130 ms (sovuq holatda ~1.3 s).

```
40 savol → 40 + 8 ≈ 48 aylanma × 130 ms ≈ 6.2 s
Prisma standarti:                          5.0 s
```

Shuning uchun **savollar soni ko'p bo'lgan imtihonlarda** yakunlash yiqilardi,
kam savollilarda esa ishlab ketardi — "ko'pincha" degani shundan.

`POST /api/attempts` (imtihonni boshlash) da ham chiqishining sababi:
`start()` avval `expireStaleAttempts()` ni chaqiradi, u esa muddati o'tgan har
bir urinish uchun **o'sha** `finalize()` ni ishga tushiradi.

### Xato ataylab takrorlandi

```
40 savolli imtihon → submit → 400 (6481 ms)  ← P2028
```

### Nima o'zgartirildi

**a) Baholar ikkita so'rovda yoziladi.** N ta `update` o'rniga ikkita
`updateMany`: biri to'g'ri javoblar ro'yxatiga, biri xatolar ro'yxatiga.

```ts
await tx.attemptQuestion.updateMany({
  where: { id: { in: correct } },
  data: { isCorrect: true },
});
```

**b) O'qishlar tranzaksiyadan tashqariga chiqarildi.** Sertifikat matni
(imtihon nomi, mutaxassislik, shifokor ismi, amal qilish muddati) urinish
natijasiga bog'liq emas — `prepareCertificate()` uni oldindan, uchta parallel
so'rovda o'qiydi.

Sertifikat raqami ham shu yerda olinadi: Postgres ketma-ketligi
(`nextval`) tranzaksiya orqaga qaytganda ham qaytmaydi, shuning uchun uni
ichkarida ushlab turishdan foyda yo'q — faqat tranzaksiya cho'ziladi.

**c) Chegaralar aniq yozildi** (`timeout: 20 s`, `maxWait: 10 s`) — zaxira
sifatida, chunki endi aylanmalar soni doimiy.

Natijada tranzaksiya ichida **savollar soniga bog'liq bo'lmagan** 4–6 aylanma
qoladi:

| | Avval | Hozir |
| --- | --- | --- |
| Tranzaksiya ichidagi aylanmalar | `N + 8` | `4–6` (doimiy) |
| 40 savol | ❌ 6481 ms — P2028 | ✅ 7535 ms (sovuq start bilan) |
| 100 savol | ❌ yiqilardi | ✅ 4362 ms |

100 savol 40 tadan tez bo'lgani tasodif emas: 40 savolli o'lchov Neon
uyg'onishini ham o'z ichiga olgan. Vaqt endi savollar soniga emas, doimiy
xarajatlarga bog'liq.

---

## 2. Tranzaksiya nima va qachon kerak

Tranzaksiya — bu **"hammasi bajariladi yoki hech nimasi bajarilmaydi"**
kafolati. Postgres'da u to'rtta xususiyat bilan ta'riflanadi (ACID):

| Xususiyat | Ma'nosi | Bizdagi misol |
| --- | --- | --- |
| **A**tomicity | Bo'linmaslik | Natija yozilib, sertifikat yozilmay qolmaydi |
| **C**onsistency | Cheklovlar buzilmaydi | `Certificate.attemptId` unikal bo'lib qoladi |
| **I**solation | So'rovlar bir-biriga xalaqit bermaydi | Yarim yozilgan natija boshqa so'rovga ko'rinmaydi |
| **D**urability | Yozilgani saqlanadi | Server o'chsa ham natija qoladi |

### Prisma'da uch xil usul

**1. Interaktiv tranzaksiya** — kod mantiqiga bog'liq bo'lganda:

```ts
await prisma.$transaction(async (tx) => {
  const snapshot = await tx.examAttempt.findUniqueOrThrow(...);
  const result = evaluate(snapshot);          // TypeScript mantiqi
  await tx.examAttempt.update(...);
}, { timeout: 20_000, maxWait: 10_000 });
```

Bu yerda `tx` ni ishlatish **majburiy**: `prisma` ni ishlatsangiz so'rov
boshqa ulanishga ketadi va tranzaksiyaga kirmaydi.

**2. Batch tranzaksiya** — bir nechta mustaqil so'rov birga:

```ts
const [items, total] = await prisma.$transaction([
  prisma.notification.findMany({ where, ...toSkipTake(query) }),
  prisma.notification.count({ where }),
]);
```

Bu yerda maqsad atomiylik emas, **izchillik**: `total` va `items` bir xil
holatdan o'qiladi, aks holda sahifalash meta'si ro'yxatga mos kelmay qolishi
mumkin.

**3. Ichma-ich yozuv** — Prisma o'zi bitta tranzaksiyaga o'raydi:

```ts
await prisma.examAttempt.create({
  data: {
    ...,
    questions: { create: [...] },   // 40 savol + 160 variant — bitta so'rovda
  },
});
```

Urinish boshlash shu usulda ishlaydi, shuning uchun u tez.

### Ikkita muhim parametr

| Parametr | Ma'nosi | Standart | Bizda |
| --- | --- | --- | --- |
| `maxWait` | Hovuzdan ulanish kutish vaqti | 2 s | 10 s |
| `timeout` | Tranzaksiya ochiq turishi mumkin bo'lgan vaqt | 5 s | 20 s |

Chegarani ko'tarish — **oxirgi chora**. Birinchi chora — tranzaksiya ichida
kamroq ish qilish, chunki ochiq tranzaksiya ulanishni band qiladi va boshqa
so'rovlarni kuttiradi.

### Amaliy qoidalar

- Tranzaksiya ichida **faqat yozuvlar va ular uchun zarur o'qishlar**.
- **HTTP so'rov, fayl o'qish, PDF yasash** — hech qachon tranzaksiya ichida.
- `Promise.all` tranzaksiyani tezlashtirmaydi — so'rovlar baribir navbatda.
- Ko'p qatorni yangilash kerak bo'lsa — `updateMany`, `createMany`, yoki
  `WHERE id IN (...)`.
- Tranzaksiya orqaga qaytganda **ketma-ketliklar qaytmaydi** — raqamda
  bo'shliq qolishi normal.

---

## 3. Bu loyihada baza bilan qanday ishlanadi

### Qatlamlar

```
Controller  → HTTP, validatsiya, ruxsat
Service     → biznes mantiq, tranzaksiya chegaralari
PrismaService → yagona mijoz, global xavfsizlik qoidalari
Postgres (Neon)
```

Prisma to'g'ridan-to'g'ri controllerdan chaqirilmaydi — faqat servis orqali.

### Prisma mijozi

`prisma-client` generatori (`prisma-client-js` emas) ishlatiladi: natija sof
TypeScript, **Rust dvigatel yo'q**. Bu serverless uchun muhim — deploy hajmi
kichik va sovuq start tez.

Ulanish `@prisma/adapter-pg` (driver adapter) orqali boradi:

```ts
new PrismaPg({
  connectionString: DATABASE_URL,   // Neon POOLED (`-pooler`)
  max: DB_POOL_SIZE,                // serverless: 1, server: 10
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
})
```

`DB_POOL_SIZE` `src/config/runtime.ts` da: Vercel'da har instansiya alohida
jarayon, o'nlab instansiya ×10 ulanish Neon limitini tez tugatib qo'yardi.

### Global xavfsizlik: `omit`

```ts
omit: {
  user: { password: true },
  questionOption: { isCorrect: true },
  attemptOption: { isCorrect: true },
}
```

Bu ustunlar **ORM darajasida** kesiladi. E'tibordan chetda qolgan `include`
ham to'g'ri javobni tashqariga chiqara olmaydi. Adminga kerak bo'lganda
`select` ichida aniq so'ralib, `omit` bekor qilinadi.

### Migratsiyalar

```bash
npm run db:migrate    # yangi migratsiya (dev)
npm run db:deploy     # mavjudlarini qo'llash (prod)
```

Ikkita ulanish satri bor:

| | Nima uchun |
| --- | --- |
| `DATABASE_URL` (pooled) | Runtime — pgbouncer orqali, ko'p ulanish |
| `DIRECT_URL` (direct) | Migratsiya va seed — pgbouncer DDL bilan ishlamaydi |

Migratsiyalar Vercel build'ida qo'llanmaydi — bu ataylab, deploy paytida
sxema o'zgarishi xavfli.

### Ma'lumot yaxlitligini kim saqlaydi

Kod emas, **baza**:

| Cheklov | Nimadan himoya qiladi |
| --- | --- |
| `Certificate.attemptId @unique` | Bitta urinishga ikkita sertifikat |
| `Question @@unique([examId, position])` | Savollar tartibida takror |
| `AttemptQuestion.selectedOptionId @unique` | Bitta variant ikki savolga tanlanishi |
| `certificate_number_seq` | Sertifikat raqamlarining takrorlanishi |
| `onDelete: Restrict` (Exam, Certificate) | Natijasi bor imtihonni o'chirish |
| `onDelete: SetNull` (Question) | Savol o'chsa tarixiy urinish yiqilishi |

### Tarix o'zgarmasligi

Urinish boshlanganda savol matni, variantlari va sozlamalar **nusxalanadi**
(`AttemptQuestion`, `AttemptOption`). Savol keyin tahrirlansa yoki o'chirilsa
ham eski natija va uning tahlili o'zgarmaydi — sertifikat orqasidagi dalil
o'zgarmasligi kerak.

### Sekin joylar va ular bilan nima qilingan

| Joy | Muammo | Yechim |
| --- | --- | --- |
| Urinishni yakunlash | Savol boshiga bitta UPDATE | Ikkita `updateMany` |
| Sozlamalarni o'qish | Har so'rovda `upsert` = **yozuv** | 30 s kesh, `findUnique` |
| Reyting | Har so'rovda to'liq qayta hisob | Mijozda 60 s kesh |
| Mutaxassislik statistikasi | N+1 xavfi | Guruhlangan so'rovlar |

Reyting hozircha har so'rovda qayta hisoblanadi. Shifokorlar soni o'n
minglarga yetganda uni alohida jadvalga materializatsiya qilish kerak bo'ladi —
`uztoz-rating` da `TeacherRanking` shu sababdan bor.
