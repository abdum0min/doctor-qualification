import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

import { PrismaClient } from '../src/generated/prisma/client';
import { UserRole } from '../src/generated/prisma/enums';
import { DEMO_EXAMS } from './seed-data/demo-exams';
import { DEMO_QUESTIONS } from './seed-data/demo-questions';

const SALT_ROUNDS = 10;

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const SPECIALTIES = [
  { name: 'Terapevt', description: 'Ichki kasalliklar bo`yicha umumiy amaliyot' },
  { name: 'Kardiolog', description: 'Yurak va qon tomir kasalliklari' },
  { name: 'Nevrolog', description: 'Asab tizimi kasalliklari' },
  { name: 'Jarroh', description: 'Umumiy jarrohlik amaliyoti' },
  { name: 'Pediatr', description: 'Bolalar salomatligi va rivojlanishi' },
  { name: 'Stomatolog', description: 'Og`iz bo`shlig`i va tish kasalliklari' },
  { name: 'Dermatolog', description: 'Teri kasalliklari' },
  { name: 'Ginekolog', description: 'Ayollar reproduktiv salomatligi' },
  { name: 'Urolog', description: 'Siydik-tanosil tizimi kasalliklari' },
  { name: 'Boshqa', description: 'Ro`yxatda keltirilmagan yo`nalishlar' },
];

const ACCOUNTS = [
  {
    fullname: 'Platforma administratori',
    email: 'admin@doctorqualification.uz',
    password: 'Admin123',
    role: UserRole.ADMIN,
  },
  {
    fullname: 'Abdullayev Anvar Anvarovich',
    email: 'doctor@doctorqualification.uz',
    password: 'Doctor123',
    role: UserRole.DOCTOR,
    specialtyName: 'Kardiolog',
    profile: {
      phone: '+998901234567',
      workplace: '1-sonli shahar klinik shifoxonasi',
      experienceYears: 8,
    },
  },
];

async function seedSpecialties(): Promise<void> {
  for (const specialty of SPECIALTIES) {
    await prisma.specialty.upsert({
      where: { name: specialty.name },
      update: { description: specialty.description },
      create: specialty,
    });
  }
}

/**
 * Savol allaqachon bor bo'lsa qayta yaratilmaydi — seed bir necha marta
 * ishga tushirilsa ham baza dublikat bilan to'lib ketmaydi.
 */
async function seedQuestions(): Promise<number> {
  let created = 0;

  for (const [specialtyName, questions] of Object.entries(DEMO_QUESTIONS)) {
    const specialty = await prisma.specialty.findUnique({
      where: { name: specialtyName },
      select: { id: true },
    });

    if (!specialty) {
      continue;
    }

    for (const question of questions) {
      const exists = await prisma.question.findFirst({
        where: { specialtyId: specialty.id, text: question.text },
        select: { id: true },
      });

      if (exists) {
        continue;
      }

      await prisma.question.create({
        data: {
          specialtyId: specialty.id,
          text: question.text,
          difficulty: question.difficulty,
          options: {
            create: question.options.map((option, position) => ({
              text: option.text,
              isCorrect: option.isCorrect,
              position,
            })),
          },
        },
      });

      created += 1;
    }
  }

  return created;
}

async function seedExams(): Promise<number> {
  let created = 0;

  for (const exam of DEMO_EXAMS) {
    const specialty = await prisma.specialty.findUnique({
      where: { name: exam.specialtyName },
      select: { id: true },
    });

    if (!specialty) {
      continue;
    }

    const available = await prisma.question.count({
      where: {
        specialtyId: specialty.id,
        isActive: true,
        ...(exam.difficulty ? { difficulty: exam.difficulty } : {}),
      },
    });

    // Demo savol bazasi kichik — sozlama savollar soniga moslashtiriladi.
    const questionCount = Math.min(exam.questionCount, available);

    if (questionCount < 1) {
      continue;
    }

    const exists = await prisma.exam.findFirst({
      where: { specialtyId: specialty.id, title: exam.title },
      select: { id: true },
    });

    if (exists) {
      continue;
    }

    await prisma.exam.create({
      data: {
        specialtyId: specialty.id,
        title: exam.title,
        description: exam.description,
        questionCount,
        timeLimitMinutes: exam.timeLimitMinutes,
        passingScore: exam.passingScore,
        difficulty: exam.difficulty,
      },
    });

    created += 1;
  }

  return created;
}

async function seedAccounts(): Promise<void> {
  for (const account of ACCOUNTS) {
    const password = await bcrypt.hash(account.password, SALT_ROUNDS);
    const specialty = account.specialtyName
      ? await prisma.specialty.findUnique({ where: { name: account.specialtyName } })
      : null;

    const profile = account.profile
      ? { ...account.profile, specialtyId: specialty?.id ?? null }
      : null;

    await prisma.user.upsert({
      where: { email: account.email },
      update: { fullname: account.fullname, role: account.role },
      create: {
        fullname: account.fullname,
        email: account.email,
        password,
        role: account.role,
        ...(profile ? { doctorProfile: { create: profile } } : {}),
      },
    });
  }
}

async function main(): Promise<void> {
  if (!connectionString) {
    throw new Error('DATABASE_URL (yoki DIRECT_URL) .env faylda topilmadi');
  }

  await seedSpecialties();
  const newQuestions = await seedQuestions();
  const newExams = await seedExams();
  await seedAccounts();

  console.log('✅ Seed tugadi');
  console.log(`   Yangi demo savollar: ${newQuestions}`);
  console.log(`   Yangi demo imtihonlar: ${newExams}`);
  for (const account of ACCOUNTS) {
    console.log(`   ${account.role.padEnd(6)} ${account.email} / ${account.password}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed xatosi:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
