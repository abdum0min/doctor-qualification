import { Difficulty } from '../../src/generated/prisma/enums';

export interface DemoQuestion {
  text: string;
  difficulty: Difficulty;
  options: { text: string; isCorrect: boolean }[];
}

export interface DemoExam {
  specialtyName: string;
  title: string;
  description: string;
  /** Bitta urinishda beriladigan savollar soni. */
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  questions: DemoQuestion[];
}

/**
 * NAMUNA (demo) imtihonlar va savollar — faqat platformani sinab ko'rish uchun.
 * Bular rasmiy klinik ko'rsatmalar yoki attestatsiya savollari EMAS va
 * hech qanday tibbiy qaror uchun asos bo'la olmaydi.
 */
export const DEMO_EXAMS: DemoExam[] = [
  {
    specialtyName: 'Terapevt',
    title: 'Terapiya — umumiy malaka imtihoni',
    description: 'Ichki kasalliklar bo`yicha asosiy bilimlarni baholash.',
    questionCount: 5,
    timeLimitMinutes: 15,
    passingScore: 60,
    questions: [
      {
        text: 'Kattalarda normal tana harorati odatda qaysi oraliqda boladi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: '36,1–37,2 °C', isCorrect: true },
          { text: '34,0–35,0 °C', isCorrect: false },
          { text: '38,0–39,0 °C', isCorrect: false },
          { text: '39,5–40,5 °C', isCorrect: false },
        ],
      },
      {
        text: 'Tinch holatdagi kattalar uchun normal yurak urish tezligi qanday?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Daqiqasiga 60–100 marta', isCorrect: true },
          { text: 'Daqiqasiga 20–40 marta', isCorrect: false },
          { text: 'Daqiqasiga 110–140 marta', isCorrect: false },
          { text: 'Daqiqasiga 150–180 marta', isCorrect: false },
        ],
      },
      {
        text: 'Arterial gipertenziya tashxisi qanday korsatkichdan boshlab qoyiladi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: '140/90 mm sim. ust. va undan yuqori', isCorrect: true },
          { text: '110/70 mm sim. ust. va undan yuqori', isCorrect: false },
          { text: '120/80 mm sim. ust. va undan yuqori', isCorrect: false },
          { text: '100/60 mm sim. ust. va undan yuqori', isCorrect: false },
        ],
      },
      {
        text: 'Qandli diabetni uzoq muddatli nazorat qilishda qaysi korsatkich ishlatiladi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'Glikirlangan gemoglobin (HbA1c)', isCorrect: true },
          { text: 'Umumiy bilirubin', isCorrect: false },
          { text: 'Qon ivish vaqti', isCorrect: false },
          { text: 'Siydik solishtirma ogirligi', isCorrect: false },
        ],
      },
      {
        text: 'Surunkali buyrak kasalligi bosqichlari asosan qaysi korsatkich boyicha aniqlanadi?',
        difficulty: Difficulty.ADVANCED,
        options: [
          { text: 'Koptokchalar filtratsiya tezligi (GFR)', isCorrect: true },
          { text: 'Yurak urish tezligi', isCorrect: false },
          { text: 'Tana harorati', isCorrect: false },
          { text: 'Nafas olish chastotasi', isCorrect: false },
        ],
      },
    ],
  },
  {
    specialtyName: 'Kardiolog',
    title: 'Kardiologiya — asosiy malaka imtihoni',
    description: 'Yurak-qon tomir kasalliklari bo`yicha malaka darajasini aniqlash.',
    questionCount: 5,
    timeLimitMinutes: 20,
    passingScore: 60,
    questions: [
      {
        text: 'Miokard infarktida eng kop uchraydigan asosiy shikoyat qaysi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Kokrak qafasi orqasidagi siquvchi ogriq', isCorrect: true },
          { text: 'Tizza bogimidagi ogriq', isCorrect: false },
          { text: 'Teri toshmasi', isCorrect: false },
          { text: 'Korish qobiliyatining yaxshilanishi', isCorrect: false },
        ],
      },
      {
        text: 'EKGda ST segmenti kotarilishi asosan nimadan darak beradi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'Miokardning otkir shikastlanishi', isCorrect: true },
          { text: 'Surunkali anemiya', isCorrect: false },
          { text: 'Gipotireoz', isCorrect: false },
          { text: 'Oshqozon yarasi', isCorrect: false },
        ],
      },
      {
        text: 'Yurak yetishmovchiligida qaysi laborator marker keng qollaniladi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'NT-proBNP', isCorrect: true },
          { text: 'Amilaza', isCorrect: false },
          { text: 'Umumiy oqsil', isCorrect: false },
          { text: 'Siydik kislotasi', isCorrect: false },
        ],
      },
      {
        text: 'Hilpillovchi aritmiyada tromboemboliya xavfini baholashda qaysi shkala ishlatiladi?',
        difficulty: Difficulty.ADVANCED,
        options: [
          { text: 'CHA2DS2-VASc', isCorrect: true },
          { text: 'Glazgo koma shkalasi', isCorrect: false },
          { text: 'Apgar shkalasi', isCorrect: false },
          { text: 'Bishop shkalasi', isCorrect: false },
        ],
      },
      {
        text: 'Chap qorincha otish fraksiyasi (EF) qanchadan past bolsa, EF pasaygan yurak yetishmovchiligi deyiladi?',
        difficulty: Difficulty.EXPERT,
        options: [
          { text: '40% dan past', isCorrect: true },
          { text: '70% dan past', isCorrect: false },
          { text: '85% dan past', isCorrect: false },
          { text: '95% dan past', isCorrect: false },
        ],
      },
    ],
  },
  {
    specialtyName: 'Kardiolog',
    title: 'Kardiologiya — boshlang`ich daraja',
    description: 'Yo`nalishga endi kirib kelayotgan shifokorlar uchun qisqa imtihon.',
    questionCount: 3,
    timeLimitMinutes: 10,
    passingScore: 60,
    questions: [
      {
        text: 'Yurak qaysi ko`krak qafasi sohasida joylashgan?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'O`rta ko`krak sohasida, biroz chapga siljigan', isCorrect: true },
          { text: 'To`liq o`ng tomonda', isCorrect: false },
          { text: 'Qorin bo`shlig`ida', isCorrect: false },
          { text: 'Chanoq sohasida', isCorrect: false },
        ],
      },
      {
        text: 'Arterial bosim qaysi asbob yordamida o`lchanadi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Tonometr', isCorrect: true },
          { text: 'Termometr', isCorrect: false },
          { text: 'Spirometr', isCorrect: false },
          { text: 'Glyukometr', isCorrect: false },
        ],
      },
      {
        text: 'Puls odatda qaysi arteriyada paypaslab tekshiriladi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Bilak arteriyasida', isCorrect: true },
          { text: 'Tizza ostidagi venada', isCorrect: false },
          { text: 'Peshona sohasida', isCorrect: false },
          { text: 'Tovon sohasida', isCorrect: false },
        ],
      },
    ],
  },
  {
    specialtyName: 'Nevrolog',
    title: 'Nevrologiya — asosiy malaka imtihoni',
    description: 'Asab tizimi kasalliklari bo`yicha baholash.',
    questionCount: 4,
    timeLimitMinutes: 15,
    passingScore: 60,
    questions: [
      {
        text: 'Insult belgilarini tez aniqlashda qaysi qoida keng qollaniladi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'FAST qoidasi', isCorrect: true },
          { text: 'ABCDE qoidasi', isCorrect: false },
          { text: 'SOAP qoidasi', isCorrect: false },
          { text: 'PQRST qoidasi', isCorrect: false },
        ],
      },
      {
        text: 'Ong darajasini baholashda qaysi shkaladan foydalaniladi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'Glazgo koma shkalasi', isCorrect: true },
          { text: 'CHA2DS2-VASc', isCorrect: false },
          { text: 'NYHA sinfi', isCorrect: false },
          { text: 'Apgar shkalasi', isCorrect: false },
        ],
      },
      {
        text: 'Meningit shubhasida tashxisni tasdiqlash uchun asosiy tekshiruv qaysi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'Lyumbal punksiya', isCorrect: true },
          { text: 'Ekvokardiografiya', isCorrect: false },
          { text: 'Kolonoskopiya', isCorrect: false },
          { text: 'Spirometriya', isCorrect: false },
        ],
      },
      {
        text: 'Parkinson kasalligining klassik uch belgisi qaysi?',
        difficulty: Difficulty.ADVANCED,
        options: [
          { text: 'Tremor, rigidlik, bradikineziya', isCorrect: true },
          { text: 'Isitma, yotal, hansirash', isCorrect: false },
          { text: 'Teri toshmasi, qichishish, shish', isCorrect: false },
          { text: 'Diareya, qusish, degidratatsiya', isCorrect: false },
        ],
      },
    ],
  },
  {
    specialtyName: 'Jarroh',
    title: 'Jarrohlik — asosiy malaka imtihoni',
    description: 'Umumiy jarrohlik amaliyoti bo`yicha bilimlarni tekshirish.',
    questionCount: 4,
    timeLimitMinutes: 15,
    passingScore: 60,
    questions: [
      {
        text: 'Otkir appenditsitda ogriq odatda qaysi sohaga kochadi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Ong yonbosh sohaga', isCorrect: true },
          { text: 'Chap yelkaga', isCorrect: false },
          { text: 'Boyin sohasiga', isCorrect: false },
          { text: 'Tizza ostiga', isCorrect: false },
        ],
      },
      {
        text: 'Jarrohlik yarasining birlamchi bitishi nima bilan tavsiflanadi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'Yara chetlari yaqinlashtirilgan holda bitishi', isCorrect: true },
          { text: 'Yiringlash orqali bitishi', isCorrect: false },
          { text: 'Faqat antibiotik tasirida bitishi', isCorrect: false },
          { text: 'Bitishning umuman bolmasligi', isCorrect: false },
        ],
      },
      {
        text: 'Operatsiyadan oldingi antibiotikoprofilaktika odatda qachon boshlanadi?',
        difficulty: Difficulty.ADVANCED,
        options: [
          { text: 'Kesishdan oldingi 60 daqiqa ichida', isCorrect: true },
          { text: 'Operatsiyadan 24 soat oldin', isCorrect: false },
          { text: 'Operatsiya tugagach 12 soatdan keyin', isCorrect: false },
          { text: 'Faqat isitma chiqqanda', isCorrect: false },
        ],
      },
      {
        text: 'Otkir qorin sindromida birinchi navbatda nima qilinadi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'Shoshilinch klinik baholash va jarroh korigi', isCorrect: true },
          { text: 'Uyda kuzatuv tavsiya qilinadi', isCorrect: false },
          { text: 'Faqat ogriq qoldiruvchi beriladi', isCorrect: false },
          { text: 'Bir hafta kutiladi', isCorrect: false },
        ],
      },
    ],
  },
  {
    specialtyName: 'Pediatr',
    title: 'Pediatriya — asosiy malaka imtihoni',
    description: 'Bolalar salomatligi bo`yicha bilimlarni baholash.',
    questionCount: 4,
    timeLimitMinutes: 15,
    passingScore: 60,
    questions: [
      {
        text: 'Yangi tugilgan chaqaloq holati qaysi shkala boyicha baholanadi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Apgar shkalasi', isCorrect: true },
          { text: 'Glazgo shkalasi', isCorrect: false },
          { text: 'NYHA sinfi', isCorrect: false },
          { text: 'Bishop shkalasi', isCorrect: false },
        ],
      },
      {
        text: 'JSST tavsiyasiga kora faqat ona suti bilan boqish necha oygacha tavsiya etiladi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: '6 oygacha', isCorrect: true },
          { text: '1 oygacha', isCorrect: false },
          { text: '12 oygacha', isCorrect: false },
          { text: '24 oygacha', isCorrect: false },
        ],
      },
      {
        text: 'Bolalarda degidratatsiyani baholashda qaysi belgi muhim hisoblanadi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'Teri turgori va siydik ajralishi', isCorrect: true },
          { text: 'Soch rangi', isCorrect: false },
          { text: 'Tirnoq uzunligi', isCorrect: false },
          { text: 'Ovoz tembri', isCorrect: false },
        ],
      },
      {
        text: 'Bolalarda febril talvasa kopincha qaysi yoshda kuzatiladi?',
        difficulty: Difficulty.ADVANCED,
        options: [
          { text: '6 oydan 5 yoshgacha', isCorrect: true },
          { text: '10 yoshdan 15 yoshgacha', isCorrect: false },
          { text: '15 yoshdan keyin', isCorrect: false },
          { text: 'Faqat chaqaloqlik davrida', isCorrect: false },
        ],
      },
    ],
  },
  {
    specialtyName: 'Stomatolog',
    title: 'Stomatologiya — asosiy malaka imtihoni',
    description: 'Og`iz bo`shlig`i va tish kasalliklari bo`yicha baholash.',
    questionCount: 4,
    timeLimitMinutes: 15,
    passingScore: 60,
    questions: [
      {
        text: 'Kattalarda doimiy tishlar soni nechta?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: '32 ta', isCorrect: true },
          { text: '20 ta', isCorrect: false },
          { text: '28 ta', isCorrect: false },
          { text: '36 ta', isCorrect: false },
        ],
      },
      {
        text: 'Tish kariyesining asosiy sababi nima?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Bakterial karash va kislota tasiri', isCorrect: true },
          { text: 'Sovuq havo', isCorrect: false },
          { text: 'Yoruglik tasiri', isCorrect: false },
          { text: 'Quruq havo', isCorrect: false },
        ],
      },
      {
        text: 'Periodontit qaysi tuzilmani zararlaydi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'Tishni ushlab turuvchi toqimalarni', isCorrect: true },
          { text: 'Faqat til shilliq qavatini', isCorrect: false },
          { text: 'Faqat lab terisini', isCorrect: false },
          { text: 'Faqat quloq suprasini', isCorrect: false },
        ],
      },
      {
        text: 'Ftor profilaktikasining asosiy maqsadi nima?',
        difficulty: Difficulty.ADVANCED,
        options: [
          { text: 'Tish emalini mustahkamlash', isCorrect: true },
          { text: 'Tish rangini oqartirish', isCorrect: false },
          { text: 'Ogiz haroratini pasaytirish', isCorrect: false },
          { text: 'Solak miqdorini kamaytirish', isCorrect: false },
        ],
      },
    ],
  },
  {
    specialtyName: 'Dermatolog',
    title: 'Dermatologiya — asosiy malaka imtihoni',
    description: 'Teri kasalliklari bo`yicha bilimlarni tekshirish.',
    questionCount: 3,
    timeLimitMinutes: 10,
    passingScore: 60,
    questions: [
      {
        text: 'Atopik dermatitning asosiy belgisi qaysi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Qichishish bilan kechuvchi quruq teri', isCorrect: true },
          { text: 'Yurak urishining tezlashishi', isCorrect: false },
          { text: 'Korish xiralashuvi', isCorrect: false },
          { text: 'Eshitishning pasayishi', isCorrect: false },
        ],
      },
      {
        text: 'Melanoma shubhasida qaysi qoida qollaniladi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'ABCDE qoidasi', isCorrect: true },
          { text: 'FAST qoidasi', isCorrect: false },
          { text: 'SOAP qoidasi', isCorrect: false },
          { text: 'RICE qoidasi', isCorrect: false },
        ],
      },
      {
        text: 'Psoriaz uchun xos teri elementi qaysi?',
        difficulty: Difficulty.ADVANCED,
        options: [
          { text: 'Kumushsimon qipiqli papula va blyashkalar', isCorrect: true },
          { text: 'Yiringli pufakchalar', isCorrect: false },
          { text: 'Teri ostiga qon quyilishi', isCorrect: false },
          { text: 'Terining butunlay yoqolishi', isCorrect: false },
        ],
      },
    ],
  },
  {
    specialtyName: 'Ginekolog',
    title: 'Ginekologiya — asosiy malaka imtihoni',
    description: 'Ayollar reproduktiv salomatligi bo`yicha baholash.',
    questionCount: 3,
    timeLimitMinutes: 10,
    passingScore: 60,
    questions: [
      {
        text: 'Normal homiladorlik ortacha necha hafta davom etadi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: '40 hafta', isCorrect: true },
          { text: '30 hafta', isCorrect: false },
          { text: '46 hafta', isCorrect: false },
          { text: '52 hafta', isCorrect: false },
        ],
      },
      {
        text: 'Bachadon boyni saratonini erta aniqlashda qaysi skrining ishlatiladi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'Pap-test (sitologik tekshiruv)', isCorrect: true },
          { text: 'Kolonoskopiya', isCorrect: false },
          { text: 'Spirometriya', isCorrect: false },
          { text: 'Ekvokardiografiya', isCorrect: false },
        ],
      },
      {
        text: 'Preeklampsiyaning asosiy belgilari qaysi?',
        difficulty: Difficulty.ADVANCED,
        options: [
          { text: 'Arterial bosim kotarilishi va proteinuriya', isCorrect: true },
          { text: 'Bradikardiya va gipotermiya', isCorrect: false },
          { text: 'Teri toshmasi va yotal', isCorrect: false },
          { text: 'Korish otkirligining oshishi', isCorrect: false },
        ],
      },
    ],
  },
  {
    specialtyName: 'Urolog',
    title: 'Urologiya — asosiy malaka imtihoni',
    description: 'Siydik-tanosil tizimi kasalliklari bo`yicha baholash.',
    questionCount: 3,
    timeLimitMinutes: 10,
    passingScore: 60,
    questions: [
      {
        text: 'Buyrak sanchigining eng kop uchraydigan sababi nima?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Siydik yollaridagi tosh', isCorrect: true },
          { text: 'Yurak yetishmovchiligi', isCorrect: false },
          { text: 'Bronxial astma', isCorrect: false },
          { text: 'Migren', isCorrect: false },
        ],
      },
      {
        text: 'Prostata bezi holatini baholashda qaysi qon markeri qollaniladi?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'PSA', isCorrect: true },
          { text: 'HbA1c', isCorrect: false },
          { text: 'NT-proBNP', isCorrect: false },
          { text: 'Amilaza', isCorrect: false },
        ],
      },
      {
        text: 'Otkir siydik tutilishida birinchi yordam nimadan iborat?',
        difficulty: Difficulty.ADVANCED,
        options: [
          { text: 'Kateterizatsiya orqali siydikni chiqarish', isCorrect: true },
          { text: 'Suyuqlik istemolini keskin oshirish', isCorrect: false },
          { text: 'Faqat kuzatuv', isCorrect: false },
          { text: 'Jismoniy mashqlar tavsiya qilish', isCorrect: false },
        ],
      },
    ],
  },
  {
    specialtyName: 'Boshqa',
    title: 'Umumiy tibbiy bilim imtihoni',
    description: 'Barcha yo`nalishlar uchun umumiy kasbiy savollar.',
    questionCount: 3,
    timeLimitMinutes: 10,
    passingScore: 60,
    questions: [
      {
        text: 'Shoshilinch tibbiy yordamda birinchi navbatda qaysi ketma-ketlik baholanadi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Nafas yollari, nafas olish, qon aylanish (ABC)', isCorrect: true },
          { text: 'Teri rangi, soch, tirnoq', isCorrect: false },
          { text: 'Boy, vazn, yosh', isCorrect: false },
          { text: 'Ism, familiya, manzil', isCorrect: false },
        ],
      },
      {
        text: 'Qol gigiyenasi kasalxona infeksiyalarini kamaytirishda qanday orin tutadi?',
        difficulty: Difficulty.BEGINNER,
        options: [
          { text: 'Eng samarali va arzon profilaktika usuli', isCorrect: true },
          { text: 'Deyarli tasir qilmaydi', isCorrect: false },
          { text: 'Faqat jarrohlik bolimida ahamiyatli', isCorrect: false },
          { text: 'Faqat epidemiya paytida kerak', isCorrect: false },
        ],
      },
      {
        text: 'Bemor malumotlari boyicha shifokorning asosiy majburiyati nima?',
        difficulty: Difficulty.INTERMEDIATE,
        options: [
          { text: 'Tibbiy sirni saqlash', isCorrect: true },
          { text: 'Hamkasblarga erkin tarqatish', isCorrect: false },
          { text: 'Ijtimoiy tarmoqda elon qilish', isCorrect: false },
          { text: 'Bemor roziligisiz nashr etish', isCorrect: false },
        ],
      },
    ],
  },
];
