# `doctor-qualification` va `uztoz-rating` farqlari

Ikkala loyiha bir xil poydevorda quriladi — NestJS 11 + Prisma 7 + PostgreSQL
backend, React 19 + Vite + Tailwind v4 + shadcn/ui frontend, bir xil javob
konverti, bir xil FSD-lite qatlamlari va bir xil boshqaruv paneli maketi.
Quyida faqat **farqlar** sanab o'tilgan.

---

## 1. Domen farqi — eng asosiysi

| | `uztoz-rating` | `doctor-qualification` |
| --- | --- | --- |
| Foydalanuvchi | O'qituvchi (`TEACHER`) | Shifokor (`DOCTOR`) |
| Bo'lim | Fan (`Subject`) | Mutaxassislik (`Specialty`) |
| Test | `Test` | `Exam` |
| Natijaning maqsadi | **Reyting o'rni** | **Malaka darajasi** |

Bu bitta farq qolgan hamma narsani belgilaydi.

`uztoz-rating` da natija — bu **musobaqa**: o'qituvchi respublika, viloyat va
tuman kesimida qancha o'rinni egallagani muhim. Shuning uchun u yerda hududlar
ierarxiyasi (`Region → District → School`) va uch xil reyting bor.

Bu yerda natija — bu **malaka to'g'risidagi hujjat**: shifokor ballga qarab
besh pog'onadan birini oladi va shu daraja sertifikatga yoziladi. Reyting bor,
lekin u ikkinchi darajali; birlamchisi — `QualificationLevel`.

```
uztoz-rating:  test → ball → reyting o'rni
doctor-qual.:  imtihon → ball → malaka darajasi → sertifikat → ochiq tekshiruv
```

---

## 2. Ma'lumotlar modeli

`uztoz-rating` — 16 model, `doctor-qualification` — 13 model.

### Faqat `uztoz-rating` da bor

| Model | Nima uchun bizda yo'q |
| --- | --- |
| `Region`, `District`, `School` | Hududiy reyting o'qituvchilar uchun asosiy talab. Tibbiyotda bunday talab `req.txt` da yo'q — ish joyi `DoctorProfile.workplace` matn maydonida. |
| `TeacherRanking` | Reyting ko'rsatkichlari alohida jadvalga materializatsiya qilingan (o'n minglab o'qituvchi uchun). Bizda reyting har so'rovda qayta hisoblanadi — hozirgi hajmda bu arzonroq va tarixiy nomuvofiqlik xavfi yo'q. |
| `enum Gender` | O'qituvchilar filtrida ishlatiladi; tibbiy malaka bahosiga aloqasi yo'q. |
| `enum OptionLabel` | U yerda variantlar qat'iy A/B/C/D. Bizda variantlar soni 2–6 va `position` bilan tartiblanadi. |

### Faqat `doctor-qualification` da bor

| Model / enum | Nima uchun kerak |
| --- | --- |
| `enum QualificationLevel` | Beshta malaka pog'onasi — platformaning asosiy mahsuloti. |
| `enum Difficulty` | Har bir savolning qiyinlik darajasi (u yerda daraja test darajasida edi). |
| `AttemptOption` | **Javob variantlarining nusxasi.** `uztoz-rating` da urinishda faqat savol nusxalanadi (`TestAttemptQuestion`), variantlar esa jonli jadvaldan o'qiladi. Sertifikat beruvchi tizimda bu yetarli emas: variant tahrirlansa eski natijaning tahlili o'zgarib ketardi. |
| `enum CertificateStatus` + `expiresAt` / `revokedAt` | Sertifikatning amal qilish muddati va bekor qilinishi. |

### Umumiy, lekin boshqacha ishlaydiganlar

**Savol qayerga tegishli.** Ikkalasida ham ierarxiya bir xil
(`Fan/Mutaxassislik → Test/Imtihon → Savol → Variant`) — bu tuzilish amalda
o'zini oqlagani uchun ataylab takrorlangan.

**Urinish nusxasi.** Ikkalasida ham sozlama qiymatlari urinish boshlanganda
nusxalanadi. Farq — yuqorida aytilgan `AttemptOption`.

---

## 3. Ataylab boshqacha qilingan qarorlar

| Qaror | `uztoz-rating` | Bu yerda | Sabab |
| --- | --- | --- | --- |
| Sertifikat raqami | Boshqa sxema | `DOC-YYYY-NNNNNN`, Postgres ketma-ketligidan | `req.txt` talabi. Ketma-ketlik takrorlanmaslikni baza darajasida kafolatlaydi. |
| PDF | — | Backendda `pdfkit` + `qrcode` | Headless brauzersiz — deploy yengil va tez. |
| Sertifikat tekshiruvi | — | Ochiq: `/verify/:certificateId`, QR kod bilan | Hujjatni tizimga kirmasdan tekshirish talabi. |
| To'g'ri javob himoyasi | Servis darajasida | **Prisma global `omit`** (`isCorrect`, `password`) | E'tibordan chetda qolgan `include` ham to'g'ri javobni tashqariga chiqara olmaydi. |
| Malaka chegaralari | — | `domain/qualification.ts` — sozlamaga chiqarilmagan | Chegara berilgan sertifikatga yozilgan; keyin o'zgartirilsa hujjatlar bir-biriga mos kelmay qoladi. |
| Reyting vaznlari | Sozlamada | Sozlamada | Bir xil yondashuv. |
| Sertifikat muddati | — | Sozlamada, lekin **berilgan paytdagi** qiymat hujjatga yoziladi | Sozlama o'zgarsa eski sertifikat o'zgarmaydi. |
| Ochiq landing sahifasi | Yo'q | Bor | Platforma tashqi auditoriyaga ham ko'rinadi. |

---

## 4. Modullar solishtiruvi

| Modul | `uztoz-rating` | `doctor-qualification` |
| --- | --- | --- |
| Auth, profil | ✅ | ✅ |
| Fan / Mutaxassislik | ✅ | ✅ |
| Test / Imtihon + savollar | ✅ | ✅ |
| Savollarni CSV/Excel import | ✅ | ✅ |
| Urinishlar va baholash | ✅ | ✅ |
| Sertifikatlar | ✅ | ✅ + muddat, bekor qilish, ochiq tekshiruv, PDF |
| Reyting | ✅ (respublika/viloyat/tuman) | ✅ (umumiy + mutaxassislik + davr filtri) |
| Bildirishnomalar va e'lonlar | ✅ | ✅ |
| Global qidiruv | ✅ | ✅ (rolga qarab toraytiriladi) |
| Platforma sozlamalari | ✅ | ✅ |
| Ommaviy profil | ✅ o'qituvchi | ✅ shifokor |
| Fayl yuklash | ✅ avatar, fan rasmi, savol rasmi | ✅ faqat avatar |
| Hududlar ierarxiyasi | ✅ | ❌ ataylab olinmagan |
| Ochiq statistika + landing | ❌ | ✅ |

---

## 5. Interfeys

Boshqaruv paneli maketi ataylab bir xil qilingan, chunki u amalda o'zini
oqlagan:

- 6 ta ko'rsatkich kartasi bir qatorda;
- asosiy ustun + 340px yon ustun (`xl:grid-cols-[1fr_340px]`);
- shifokorda: natijalar dinamikasi grafigi, so'nggi natijalar, mavjud
  imtihonlar, TOP ro'yxat, e'lonlar va sertifikat chaqirig'i;
- adminda: kunlik faollik, o'rtacha ball dinamikasi, o'sish grafigi va
  bo'limlar kesimidagi natijalar.

Farqlar:

| | `uztoz-rating` | Bu yerda |
| --- | --- | --- |
| Shifokor stat kartalari | Respublika / viloyat / tuman reytingi | Umumiy reyting o'rni, o'rtacha va eng yuqori ball, oxirgi natija, imtihonlar, sertifikatlar |
| Admin to'rtinchi grafigi | Viloyatlar bo'yicha natijalar | Natijalar taqsimoti (o'tgan / o'ta olmagan / amaldagi sertifikatlar) |
| TOP vidjeti | TOP 10 o'qituvchi | TOP — shifokorning o'z yo'nalishi bo'yicha |
| Qo'ng'iroq | Ikkala rolda | Faqat shifokorda — bu yerda xabarlar faqat shifokorlarga yoziladi, adminda u doim bo'sh turardi |

---

## 6. Qisqacha xulosa

`uztoz-rating` — **musobaqa platformasi**: kim qayerda turibdi.
`doctor-qualification` — **attestatsiya platformasi**: kim nimaga qodir va buni
qanday hujjat tasdiqlaydi.

Shuning uchun u yerda hududiy ierarxiya va materializatsiya qilingan reyting
markazda; bu yerda esa malaka darajasi, o'zgarmas urinish nusxasi va tekshirib
bo'ladigan sertifikat markazda. Qolgan barcha modullar — bildirishnomalar,
qidiruv, import, sozlamalar, ommaviy profil, fayl yuklash — ikkalasida ham bor
va bir xil qolipda ishlaydi.
