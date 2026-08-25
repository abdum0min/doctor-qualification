import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

import { PrismaClient } from '../src/generated/prisma/client';
import { UserRole } from '../src/generated/prisma/enums';

const SALT_ROUNDS = 10;

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

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
    profile: {
      phone: '+998901234567',
      workplace: '1-sonli shahar klinik shifoxonasi',
      experienceYears: 8,
    },
  },
];

async function seedAccounts(): Promise<void> {
  for (const account of ACCOUNTS) {
    const password = await bcrypt.hash(account.password, SALT_ROUNDS);

    await prisma.user.upsert({
      where: { email: account.email },
      update: { fullname: account.fullname, role: account.role },
      create: {
        fullname: account.fullname,
        email: account.email,
        password,
        role: account.role,
        ...(account.profile
          ? { doctorProfile: { create: account.profile } }
          : {}),
      },
    });
  }
}

async function main(): Promise<void> {
  if (!connectionString) {
    throw new Error('DATABASE_URL (yoki DIRECT_URL) .env faylda topilmadi');
  }

  await seedAccounts();

  console.log('✅ Seed tugadi');
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
