import 'dotenv/config';

import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

import { PrismaClient } from '../src/generated/prisma/client';
import { UserRole } from '../src/generated/prisma/enums';

const DEMO_USER_COUNT = 8;
const SALT_ROUNDS = 10;

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/**
 * Seed idempotent: `upsert` ishlatilgani uchun bir necha marta ishga tushirsa
 * ham dublikat yaratmaydi va mavjud parollarni qayta yozmaydi.
 */
async function main(): Promise<void> {
  if (!connectionString) {
    throw new Error('DATABASE_URL (yoki DIRECT_URL) .env faylda topilmadi');
  }

  const accounts = [
    {
      fullname: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123',
      role: UserRole.ADMIN,
    },
    {
      fullname: 'Demo User',
      email: 'user@example.com',
      password: 'User1234',
      role: UserRole.USER,
    },
  ];

  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: { fullname: account.fullname, role: account.role },
      create: {
        ...account,
        password: await bcrypt.hash(account.password, SALT_ROUNDS),
      },
    });
  }

  const demoPassword = await bcrypt.hash('User1234', SALT_ROUNDS);

  await prisma.user.createMany({
    data: Array.from({ length: DEMO_USER_COUNT }, () => ({
      fullname: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: demoPassword,
      role: UserRole.USER,
    })),
    skipDuplicates: true,
  });

  const total = await prisma.user.count();

  console.log(`✅ Seed tugadi. Jami foydalanuvchilar: ${total}`);
  console.log('   admin@example.com / Admin123');
  console.log('   user@example.com  / User1234');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed xatosi:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
