import { PrismaClient } from '../../src/generated/prisma/client';
import {
  NotificationType,
  UserRole,
} from '../../src/generated/prisma/enums';

interface SeededNotifications {
  notifications: number;
  announcements: number;
}

interface DemoAnnouncement {
  title: string;
  body: string;
  link: string | null;
  /** Faqat shu mutaxassislikdagi shifokorlarga; `null` — barchasiga. */
  specialtyName: string | null;
  daysAgo: number;
  /** Qabul qiluvchilarning shuncha foizi xabarni o'qigan bo'ladi. */
  readRatio: number;
}

/**
 * Boshlang'ich xabarlar — bildirishnomalar bo'limi bo'sh ko'rinmasligi uchun.
 * Har biri administrator e'loni sifatida tarixga ham yoziladi.
 */
const DEMO_ANNOUNCEMENTS: DemoAnnouncement[] = [
  {
    title: 'Platforma ishga tushdi',
    body: "Doctor Qualification platformasi ochildi. Mutaxassisligingizni tanlang va birinchi imtihonni topshiring.",
    link: '/exams',
    specialtyName: null,
    daysAgo: 21,
    readRatio: 1,
  },
  {
    title: 'Kardiologiya bo`yicha yangi imtihonlar',
    body: 'Kardiolog yo`nalishida savollar bazasi yangilandi — imtihonni qayta topshirib, natijangizni yaxshilashingiz mumkin.',
    link: '/exams',
    specialtyName: 'Kardiolog',
    daysAgo: 7,
    readRatio: 0.5,
  },
  {
    title: 'Sertifikat muddati haqida',
    body: 'Berilgan sertifikatlar 12 oy amal qiladi. Muddati tugashidan oldin imtihonni qayta topshiring.',
    link: '/certificates',
    specialtyName: null,
    daysAgo: 2,
    readRatio: 0,
  },
];

/**
 * Sertifikat berilgani haqidagi xabarlar urinish yozuvlaridan kelib chiqadi —
 * shunda demo ma'lumot haqiqiy oqimga mos bo'ladi.
 */
export async function seedDemoNotifications(
  prisma: PrismaClient,
): Promise<SeededNotifications> {
  const result: SeededNotifications = { notifications: 0, announcements: 0 };

  const existing = await prisma.announcement.count();

  if (existing > 0) {
    return result;
  }

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
    select: { id: true },
  });

  for (const demo of DEMO_ANNOUNCEMENTS) {
    const recipients = await prisma.doctorProfile.findMany({
      where: {
        user: { isActive: true },
        ...(demo.specialtyName
          ? { specialty: { name: demo.specialtyName } }
          : {}),
      },
      select: { userId: true },
    });

    if (recipients.length === 0) {
      continue;
    }

    const createdAt = daysAgo(demo.daysAgo);
    const readCount = Math.round(recipients.length * demo.readRatio);

    await prisma.announcement.create({
      data: {
        title: demo.title,
        body: demo.body,
        link: demo.link,
        audience: demo.specialtyName ?? 'Barcha shifokorlar',
        recipientCount: recipients.length,
        sentById: admin?.id ?? null,
        createdAt,
      },
    });
    result.announcements += 1;

    await prisma.notification.createMany({
      data: recipients.map((recipient, index) => ({
        userId: recipient.userId,
        type: NotificationType.SYSTEM,
        title: demo.title,
        body: demo.body,
        link: demo.link,
        createdAt,
        readAt: index < readCount ? createdAt : null,
      })),
    });
    result.notifications += recipients.length;
  }

  result.notifications += await seedCertificateNotifications(prisma);

  return result;
}

async function seedCertificateNotifications(
  prisma: PrismaClient,
): Promise<number> {
  const certificates = await prisma.certificate.findMany({
    select: {
      certificateId: true,
      examTitle: true,
      issuedAt: true,
      doctorProfile: { select: { userId: true } },
    },
  });

  if (certificates.length === 0) {
    return 0;
  }

  const created = await prisma.notification.createMany({
    data: certificates.map((certificate) => ({
      userId: certificate.doctorProfile.userId,
      type: NotificationType.CERTIFICATE_ISSUED,
      title: 'Sertifikat berildi',
      body: `"${certificate.examTitle}" imtihoni bo'yicha ${certificate.certificateId} raqamli sertifikat rasmiylashtirildi.`,
      link: '/certificates',
      createdAt: certificate.issuedAt,
      // Eski sertifikat xabarlari o'qilgan deb belgilanadi.
      readAt: certificate.issuedAt,
    })),
  });

  return created.count;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return date;
}
