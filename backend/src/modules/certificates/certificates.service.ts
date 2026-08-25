import { Injectable, NotFoundException } from '@nestjs/common';

import { CursorPaginated } from 'src/common/interfaces/api-response.interface';
import { decodeCursor } from 'src/common/utils/cursor.util';
import { buildCursorPaginated } from 'src/common/utils/pagination.util';
import {
  buildCertificateId,
  certificateExpiryDate,
  type VerificationStatus,
} from 'src/domain/certificate';
import { Prisma } from 'src/generated/prisma/client';
import {
  CertificateStatus,
  QualificationLevel,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { CertificateQueryDto } from './dto/certificate-query.dto';

export interface CertificateView {
  id: number;
  certificateId: string;
  attemptId: number;
  doctorFullname: string;
  specialtyName: string;
  examTitle: string;
  score: number;
  qualification: QualificationLevel;
  status: CertificateStatus;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  revokedReason: string | null;
}

/** Ommaviy tekshiruv javobi — shifokorning shaxsiy ma'lumotlari chiqmaydi. */
export interface CertificateVerificationView {
  status: VerificationStatus;
  certificate: {
    certificateId: string;
    doctorFullname: string;
    specialtyName: string;
    examTitle: string;
    score: number;
    qualification: QualificationLevel;
    issuedAt: Date;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null;
}

const certificateSelect = {
  id: true,
  certificateId: true,
  attemptId: true,
  doctorFullname: true,
  specialtyName: true,
  examTitle: true,
  score: true,
  qualification: true,
  status: true,
  issuedAt: true,
  expiresAt: true,
  revokedAt: true,
  revokedReason: true,
} satisfies Prisma.CertificateSelect;

interface IssuableAttempt {
  id: number;
  doctorProfileId: number;
  score: number | null;
  qualification: QualificationLevel | null;
  passed: boolean | null;
}

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Urinish yakunlanayotgan tranzaksiya ichida chaqiriladi — natija va
   * sertifikat birgalikda yoziladi yoki ikkalasi ham yozilmaydi.
   */
  async issueForAttempt(
    tx: Prisma.TransactionClient,
    attempt: IssuableAttempt,
  ): Promise<void> {
    if (!attempt.passed || attempt.score === null || !attempt.qualification) {
      return;
    }

    const existing = await tx.certificate.findUnique({
      where: { attemptId: attempt.id },
      select: { id: true },
    });

    if (existing) {
      return;
    }

    const details = await tx.examAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
      select: {
        exam: {
          select: { title: true, specialty: { select: { name: true } } },
        },
        doctorProfile: { select: { user: { select: { fullname: true } } } },
      },
    });

    const issuedAt = new Date();

    await tx.certificate.create({
      data: {
        certificateId: buildCertificateId(await nextSequence(tx), issuedAt),
        attemptId: attempt.id,
        doctorProfileId: attempt.doctorProfileId,
        doctorFullname: details.doctorProfile.user.fullname,
        specialtyName: details.exam.specialty.name,
        examTitle: details.exam.title,
        score: attempt.score,
        qualification: attempt.qualification,
        issuedAt,
        expiresAt: certificateExpiryDate(issuedAt),
      },
    });
  }

  async findOwn(
    userId: number,
    query: CertificateQueryDto,
  ): Promise<CursorPaginated<CertificateView>> {
    const doctorProfile = await this.requireDoctorProfile(userId);
    const cursor = decodeCursor(query.cursor);

    const rows = await this.prisma.certificate.findMany({
      where: { doctorProfileId: doctorProfile.id },
      select: certificateSelect,
      take: query.limit + 1,
      ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
      orderBy: [{ issuedAt: 'desc' }, { id: 'desc' }],
    });

    return buildCursorPaginated(rows, query.limit, 'issuedAt');
  }

  async findOwnByCertificateId(
    userId: number,
    certificateId: string,
  ): Promise<CertificateView> {
    const doctorProfile = await this.requireDoctorProfile(userId);

    const certificate = await this.prisma.certificate.findFirst({
      where: { certificateId, doctorProfileId: doctorProfile.id },
      select: certificateSelect,
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async verify(certificateId: string): Promise<CertificateVerificationView> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { certificateId },
      select: certificateSelect,
    });

    if (!certificate) {
      return { status: 'NOT_FOUND', certificate: null };
    }

    return {
      status: resolveStatus(certificate),
      certificate: {
        certificateId: certificate.certificateId,
        doctorFullname: certificate.doctorFullname,
        specialtyName: certificate.specialtyName,
        examTitle: certificate.examTitle,
        score: certificate.score,
        qualification: certificate.qualification,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        revokedAt: certificate.revokedAt,
      },
    };
  }

  private async requireDoctorProfile(userId: number): Promise<{ id: number }> {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    return profile;
  }
}

export function resolveStatus(certificate: {
  status: CertificateStatus;
  expiresAt: Date;
}): VerificationStatus {
  if (certificate.status === CertificateStatus.REVOKED) {
    return 'REVOKED';
  }

  return certificate.expiresAt.getTime() < Date.now() ? 'EXPIRED' : 'VALID';
}

async function nextSequence(tx: Prisma.TransactionClient): Promise<number> {
  const [row] = await tx.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('certificate_number_seq')
  `;

  return Number(row.nextval);
}
