import { Difficulty } from '../../src/generated/prisma/enums';

export interface DemoExam {
  specialtyName: string;
  title: string;
  description: string;
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  difficulty: Difficulty | null;
}

/** Demo imtihon sozlamalari — platformani sinab ko'rish uchun. */
export const DEMO_EXAMS: DemoExam[] = [
  {
    specialtyName: 'Terapevt',
    title: 'Terapiya — umumiy malaka imtihoni',
    description: 'Ichki kasalliklar bo`yicha asosiy bilimlarni baholash.',
    questionCount: 5,
    timeLimitMinutes: 15,
    passingScore: 60,
    difficulty: null,
  },
  {
    specialtyName: 'Kardiolog',
    title: 'Kardiologiya — asosiy malaka imtihoni',
    description: 'Yurak-qon tomir kasalliklari bo`yicha malaka darajasini aniqlash.',
    questionCount: 5,
    timeLimitMinutes: 20,
    passingScore: 60,
    difficulty: null,
  },
  {
    specialtyName: 'Kardiolog',
    title: 'Kardiologiya — boshlang`ich daraja',
    description: 'Yo`nalishga endi kirib kelayotgan shifokorlar uchun.',
    questionCount: 1,
    timeLimitMinutes: 10,
    passingScore: 50,
    difficulty: Difficulty.BEGINNER,
  },
  {
    specialtyName: 'Nevrolog',
    title: 'Nevrologiya — asosiy malaka imtihoni',
    description: 'Asab tizimi kasalliklari bo`yicha baholash.',
    questionCount: 4,
    timeLimitMinutes: 15,
    passingScore: 60,
    difficulty: null,
  },
  {
    specialtyName: 'Jarroh',
    title: 'Jarrohlik — asosiy malaka imtihoni',
    description: 'Umumiy jarrohlik amaliyoti bo`yicha bilimlarni tekshirish.',
    questionCount: 4,
    timeLimitMinutes: 15,
    passingScore: 60,
    difficulty: null,
  },
  {
    specialtyName: 'Pediatr',
    title: 'Pediatriya — asosiy malaka imtihoni',
    description: 'Bolalar salomatligi bo`yicha bilimlarni baholash.',
    questionCount: 4,
    timeLimitMinutes: 15,
    passingScore: 60,
    difficulty: null,
  },
  {
    specialtyName: 'Stomatolog',
    title: 'Stomatologiya — asosiy malaka imtihoni',
    description: 'Og`iz bo`shlig`i va tish kasalliklari bo`yicha baholash.',
    questionCount: 4,
    timeLimitMinutes: 15,
    passingScore: 60,
    difficulty: null,
  },
  {
    specialtyName: 'Dermatolog',
    title: 'Dermatologiya — asosiy malaka imtihoni',
    description: 'Teri kasalliklari bo`yicha bilimlarni tekshirish.',
    questionCount: 3,
    timeLimitMinutes: 10,
    passingScore: 60,
    difficulty: null,
  },
  {
    specialtyName: 'Ginekolog',
    title: 'Ginekologiya — asosiy malaka imtihoni',
    description: 'Ayollar reproduktiv salomatligi bo`yicha baholash.',
    questionCount: 3,
    timeLimitMinutes: 10,
    passingScore: 60,
    difficulty: null,
  },
  {
    specialtyName: 'Urolog',
    title: 'Urologiya — asosiy malaka imtihoni',
    description: 'Siydik-tanosil tizimi kasalliklari bo`yicha baholash.',
    questionCount: 3,
    timeLimitMinutes: 10,
    passingScore: 60,
    difficulty: null,
  },
];
