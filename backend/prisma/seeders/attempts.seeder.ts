import * as bcrypt from 'bcrypt';

import { PrismaClient } from '../../src/generated/prisma/client';
import { AttemptStatus, UserRole } from '../../src/generated/prisma/enums';
import {
  buildCertificateId,
  certificateExpiryDate,
} from '../../src/domain/certificate';
import { calculateScore, qualificationForScore } from '../../src/domain/qualification';
import { DEMO_DOCTORS, type DemoDoctor } from '../seed-data/demo-doctors';

const SALT_ROUNDS = 10;
const DEMO_PASSWORD = 'Doctor123';

interface SeededAttempts {
  doctors: number;
  attempts: number;
  certificates: number;
}

/**
 * Demo shifokorlar uchun to'liq urinish yozuvlarini yaratadi: savol nusxalari,
 * tanlangan javoblar, hisoblangan natija va o'tganlar uchun sertifikat.
 * Natija shu yerda ham servisdagi bir xil domen funksiyalari bilan hisoblanadi.
 */
export async function seedDemoAttempts(
  prisma: PrismaClient,
): Promise<SeededAttempts> {
  const password = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
  const result: SeededAttempts = { doctors: 0, attempts: 0, certificates: 0 };

  for (const demo of DEMO_DOCTORS) {
    const existing = await prisma.user.findUnique({
      where: { email: demo.email },
      select: { id: true },
    });

    if (existing) {
      continue;
    }

    const specialty = await prisma.specialty.findUnique({
      where: { name: demo.specialtyName },
      select: { id: true },
    });

    if (!specialty) {
      continue;
    }

    const user = await prisma.user.create({
      data: {
        fullname: demo.fullname,
        email: demo.email,
        password,
        role: UserRole.DOCTOR,
        doctorProfile: {
          create: {
            specialtyId: specialty.id,
            workplace: demo.workplace,
            phone: demo.phone,
            experienceYears: demo.experienceYears,
          },
        },
      },
      select: { doctorProfile: { select: { id: true } } },
    });

    const doctorProfileId = user.doctorProfile!.id;
    result.doctors += 1;

    const exams = await prisma.exam.findMany({
      where: { specialtyId: specialty.id, isActive: true },
      select: {
        id: true,
        title: true,
        questionCount: true,
        timeLimitMinutes: true,
        passingScore: true,
        specialty: { select: { name: true } },
        questions: {
          where: { isActive: true },
          select: {
            id: true,
            text: true,
            difficulty: true,
            options: {
              select: { text: true, isCorrect: true },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    for (const plan of demo.attempts) {
      const exam = exams[plan.examIndex];

      if (!exam || exam.questions.length === 0) {
        continue;
      }

      const questions = exam.questions.slice(0, exam.questionCount);
      const correctTarget = Math.round(questions.length * plan.accuracy);

      const completedAt = daysAgo(plan.daysAgo);
      const startedAt = new Date(
        completedAt.getTime() - exam.timeLimitMinutes * 60_000 * 0.6,
      );

      const attempt = await prisma.examAttempt.create({
        data: {
          examId: exam.id,
          doctorProfileId,
          status: AttemptStatus.SUBMITTED,
          questionCount: questions.length,
          timeLimitMinutes: exam.timeLimitMinutes,
          passingScore: exam.passingScore,
          startedAt,
          deadlineAt: new Date(
            startedAt.getTime() + exam.timeLimitMinutes * 60_000,
          ),
          completedAt,
          questions: {
            create: questions.map((question, position) => ({
              questionId: question.id,
              position,
              questionText: question.text,
              difficulty: question.difficulty,
              options: {
                create: question.options.map((option, optionPosition) => ({
                  position: optionPosition,
                  text: option.text,
                  isCorrect: option.isCorrect,
                })),
              },
            })),
          },
        },
        select: {
          id: true,
          questions: {
            select: {
              id: true,
              options: { select: { id: true, isCorrect: true } },
            },
            orderBy: { position: 'asc' },
          },
        },
      });

      // Birinchi `correctTarget` ta savolga to'g'ri, qolganiga noto'g'ri javob.
      let correctCount = 0;
      for (const [index, question] of attempt.questions.entries()) {
        const wantCorrect = index < correctTarget;
        const option =
          question.options.find((item) => item.isCorrect === wantCorrect) ??
          question.options[0];

        await prisma.attemptQuestion.update({
          where: { id: question.id },
          data: { selectedOptionId: option.id, isCorrect: option.isCorrect },
        });

        if (option.isCorrect) {
          correctCount += 1;
        }
      }

      const score = calculateScore(correctCount, questions.length);
      const passed = score >= exam.passingScore;

      await prisma.examAttempt.update({
        where: { id: attempt.id },
        data: {
          correctCount,
          score,
          qualification: qualificationForScore(score),
          passed,
        },
      });

      result.attempts += 1;

      if (passed) {
        const issuedAt = completedAt;

        await prisma.certificate.create({
          data: {
            certificateId: buildCertificateId(
              await nextCertificateNumber(prisma),
              issuedAt,
            ),
            attemptId: attempt.id,
            doctorProfileId,
            doctorFullname: demo.fullname,
            specialtyName: exam.specialty.name,
            examTitle: exam.title,
            score,
            qualification: qualificationForScore(score),
            issuedAt,
            expiresAt: certificateExpiryDate(issuedAt),
          },
        });

        result.certificates += 1;
      }
    }
  }

  return result;
}

export function demoDoctorLogin(): { email: string; password: string } {
  return { email: DEMO_DOCTORS[0].email, password: DEMO_PASSWORD };
}

export type { DemoDoctor };

async function nextCertificateNumber(prisma: PrismaClient): Promise<number> {
  const [row] = await prisma.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('certificate_number_seq')
  `;

  return Number(row.nextval);
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return date;
}
