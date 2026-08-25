export interface DemoAttemptPlan {
  /** Qaysi imtihon — mutaxassislik ichidagi tartib raqami (0 = birinchisi). */
  examIndex: number;
  /** To'g'ri javob berilgan savollar ulushi (0..1). */
  accuracy: number;
  /** Urinish necha kun oldin topshirilgan. */
  daysAgo: number;
}

export interface DemoDoctor {
  fullname: string;
  email: string;
  specialtyName: string;
  workplace: string;
  phone: string;
  experienceYears: number;
  attempts: DemoAttemptPlan[];
}

/**
 * Demo shifokorlar — barcha ekranlar (natijalar, reyting, sertifikatlar)
 * bo'sh ko'rinmasligi uchun. Parol hammasida `Doctor123`.
 * Natijalar ataylab turlicha: o'tganlar ham, yiqilganlar ham bor.
 */
export const DEMO_DOCTORS: DemoDoctor[] = [
  {
    fullname: 'Karimova Nilufar Baxtiyorovna',
    email: 'nilufar.karimova@doctorqualification.uz',
    specialtyName: 'Kardiolog',
    workplace: 'Respublika ixtisoslashtirilgan kardiologiya markazi',
    phone: '+998901112201',
    experienceYears: 12,
    attempts: [
      { examIndex: 0, accuracy: 1, daysAgo: 40 },
      { examIndex: 0, accuracy: 0.8, daysAgo: 12 },
      { examIndex: 1, accuracy: 1, daysAgo: 4 },
    ],
  },
  {
    fullname: 'Rahimov Jasur Toshpo`latovich',
    email: 'jasur.rahimov@doctorqualification.uz',
    specialtyName: 'Terapevt',
    workplace: '3-sonli oilaviy poliklinika',
    phone: '+998901112202',
    experienceYears: 7,
    attempts: [
      { examIndex: 0, accuracy: 0.8, daysAgo: 25 },
      { examIndex: 0, accuracy: 0.6, daysAgo: 6 },
    ],
  },
  {
    fullname: 'Yusupova Dilnoza Alisherovna',
    email: 'dilnoza.yusupova@doctorqualification.uz',
    specialtyName: 'Pediatr',
    workplace: '2-sonli bolalar shifoxonasi',
    phone: '+998901112203',
    experienceYears: 9,
    attempts: [
      { examIndex: 0, accuracy: 1, daysAgo: 30 },
      { examIndex: 0, accuracy: 0.75, daysAgo: 9 },
    ],
  },
  {
    fullname: 'Tursunov Bekzod Rustamovich',
    email: 'bekzod.tursunov@doctorqualification.uz',
    specialtyName: 'Jarroh',
    workplace: '1-sonli respublika shoshilinch yordam markazi',
    phone: '+998901112204',
    experienceYears: 15,
    attempts: [
      { examIndex: 0, accuracy: 0.75, daysAgo: 20 },
      { examIndex: 0, accuracy: 1, daysAgo: 3 },
    ],
  },
  {
    fullname: 'Sobirova Malika Farhodovna',
    email: 'malika.sobirova@doctorqualification.uz',
    specialtyName: 'Nevrolog',
    workplace: 'Toshkent tibbiyot akademiyasi klinikasi',
    phone: '+998901112205',
    experienceYears: 5,
    attempts: [{ examIndex: 0, accuracy: 0.5, daysAgo: 15 }],
  },
  {
    fullname: 'Nazarov Otabek Shuhratovich',
    email: 'otabek.nazarov@doctorqualification.uz',
    specialtyName: 'Stomatolog',
    workplace: 'Shahar stomatologiya poliklinikasi',
    phone: '+998901112206',
    experienceYears: 6,
    attempts: [
      { examIndex: 0, accuracy: 0.25, daysAgo: 18 },
      { examIndex: 0, accuracy: 0.75, daysAgo: 2 },
    ],
  },
  {
    fullname: 'Ismoilova Zarina Davronovna',
    email: 'zarina.ismoilova@doctorqualification.uz',
    specialtyName: 'Ginekolog',
    workplace: 'Perinatal markaz',
    phone: '+998901112207',
    experienceYears: 11,
    attempts: [{ examIndex: 0, accuracy: 1, daysAgo: 7 }],
  },
  {
    fullname: 'Xolmatov Sanjar Umidovich',
    email: 'sanjar.xolmatov@doctorqualification.uz',
    specialtyName: 'Urolog',
    workplace: '4-sonli shahar klinik shifoxonasi',
    phone: '+998901112208',
    experienceYears: 8,
    attempts: [{ examIndex: 0, accuracy: 0.33, daysAgo: 11 }],
  },
];
