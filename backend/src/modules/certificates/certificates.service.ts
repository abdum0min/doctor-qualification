import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Paginated } from 'src/common/interfaces/api-response.interface';
import { AuthenticatedUser } from 'src/common/types/authenticated-user.type';
import { buildPaginated, toSkipTake } from 'src/common/utils/pagination.util';
import {
  buildCertificateId,
  certificateExpiryDate,
  type VerificationStatus,
} from 'src/domain/certificate';
import { Prisma } from 'src/generated/prisma/client';
import {
  CertificateStatus,
  NotificationType,
  QualificationLevel,
  UserRole,
} from 'src/generated/prisma/enums';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SettingsService } from 'src/modules/settings/settings.service';

import { AdminCertificateQueryDto } from './dto/admin-certificate-query.dto';
import { CertificateQueryDto } from './dto/certificate-query.dto';
import { RevokeCertificateDto } from './dto/revoke-certificate.dto';

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

/**
 * Sertifikat uchun kerak bo'ladigan, tranzaksiyaga bog'liq bo'lmagan
 * ma'lumot. Uni oldindan o'qib olamiz — tranzaksiya ichidagi har bir so'rov
 * uning umrini cho'zadi va `P2028` (timeout) xavfini oshiradi.
 */
export interface CertificateDraft {
  certificateId: string;
  doctorFullname: string;
  specialtyName: string;
  examTitle: string;
  doctorUserId: number;
  issuedAt: Date;
  expiresAt: Date;
}

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly settings: SettingsService,
  ) {}

  /**
   * Sertifikat matnini tranzaksiyadan **tashqarida** tayyorlaydi.
   *
   * Bu qiymatlar (imtihon nomi, mutaxassislik, shifokor ismi, amal qilish
   * muddati) urinish natijasiga bog'liq emas, shuning uchun ularni oldindan
   * o'qish xavfsiz. Raqam ham shu yerda olinadi: Postgres ketma-ketligi
   * tranzaksiya bilan orqaga qaytmaydi, ya'ni uni ichkarida ushlab turishdan
   * foyda yo'q — faqat tranzaksiya cho'ziladi.
   */
  async prepareCertificate(attemptId: number): Promise<CertificateDraft> {
    const [details, validityMonths, sequence] = await Promise.all([
      this.prisma.examAttempt.findUniqueOrThrow({
        where: { id: attemptId },
        select: {
          exam: {
            select: { title: true, specialty: { select: { name: true } } },
          },
          doctorProfile: {
            select: { user: { select: { id: true, fullname: true } } },
          },
        },
      }),
      this.settings.certificateValidityMonths(),
      nextSequence(this.prisma),
    ]);

    const issuedAt = new Date();

    return {
      certificateId: buildCertificateId(sequence, issuedAt),
      doctorFullname: details.doctorProfile.user.fullname,
      specialtyName: details.exam.specialty.name,
      examTitle: details.exam.title,
      doctorUserId: details.doctorProfile.user.id,
      issuedAt,
      expiresAt: certificateExpiryDate(issuedAt, validityMonths),
    };
  }

  /**
   * Urinish yakunlanayotgan tranzaksiya ichida chaqiriladi — natija va
   * sertifikat birgalikda yoziladi yoki ikkalasi ham yozilmaydi.
   *
   * Bu yerda faqat yozuv bo'ladi: o'qishlar `prepareCertificate` da.
   */
  async issueForAttempt(
    tx: Prisma.TransactionClient,
    attempt: IssuableAttempt,
    draft: CertificateDraft,
  ): Promise<void> {
    if (!attempt.passed || attempt.score === null || !attempt.qualification) {
      return;
    }

    // Takroriy berishdan `Certificate.attemptId` ustidagi unikal cheklov
    // himoya qiladi; bu tekshiruv esa keraksiz xatoni oldini oladi.
    const existing = await tx.certificate.findUnique({
      where: { attemptId: attempt.id },
      select: { id: true },
    });

    if (existing) {
      return;
    }

    await tx.certificate.create({
      data: {
        certificateId: draft.certificateId,
        attemptId: attempt.id,
        doctorProfileId: attempt.doctorProfileId,
        doctorFullname: draft.doctorFullname,
        specialtyName: draft.specialtyName,
        examTitle: draft.examTitle,
        score: attempt.score,
        qualification: attempt.qualification,
        issuedAt: draft.issuedAt,
        expiresAt: draft.expiresAt,
      },
    });

    // Xabar ham shu tranzaksiyada — sertifikat yozilmasa xabar ham qolmaydi.
    await tx.notification.create({
      data: {
        userId: draft.doctorUserId,
        type: NotificationType.CERTIFICATE_ISSUED,
        title: 'Sertifikat berildi',
        body: `"${draft.examTitle}" imtihoni bo'yicha ${draft.certificateId} raqamli sertifikat rasmiylashtirildi.`,
        link: '/certificates',
      },
    });
  }

  async findOwn(
    userId: number,
    query: CertificateQueryDto,
  ): Promise<Paginated<CertificateView>> {
    const doctorProfile = await this.requireDoctorProfile(userId);

    const where = { doctorProfileId: doctorProfile.id };

    const [rows, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where,
        select: certificateSelect,
        ...toSkipTake(query),
        orderBy: [{ issuedAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.certificate.count({ where }),
    ]);

    return buildPaginated(rows, total, query);
  }

  /**
   * Admin istalgan sertifikatni yuklab oladi, shifokor esa faqat o'zinikini —
   * shuning uchun filtr rolga qarab quriladi.
   */
  async findForDownload(
    user: AuthenticatedUser,
    certificateId: string,
  ): Promise<CertificateView> {
    const ownerFilter =
      user.role === UserRole.ADMIN
        ? {}
        : { doctorProfileId: (await this.requireDoctorProfile(user.id)).id };

    const certificate = await this.prisma.certificate.findFirst({
      where: { certificateId, ...ownerFilter },
      select: certificateSelect,
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async findAll(
    query: AdminCertificateQueryDto,
  ): Promise<Paginated<CertificateView>> {
    const where: Prisma.CertificateWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              {
                certificateId: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                doctorFullname: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where,
        select: certificateSelect,
        ...toSkipTake(query),
        orderBy: [{ issuedAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.certificate.count({ where }),
    ]);

    return buildPaginated(rows, total, query);
  }

  /**
   * Bekor qilish yozuvni o'chirmaydi — tarix saqlanadi va ommaviy tekshiruv
   * darhol REVOKED holatini ko'rsatadi.
   */
  async revoke(
    certificateId: string,
    dto: RevokeCertificateDto,
  ): Promise<CertificateView> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { certificateId },
      select: {
        id: true,
        status: true,
        examTitle: true,
        doctorProfile: { select: { userId: true } },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.status === CertificateStatus.REVOKED) {
      throw new ConflictException('This certificate is already revoked');
    }

    const revoked = await this.prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        status: CertificateStatus.REVOKED,
        revokedAt: new Date(),
        revokedReason: dto.reason ?? null,
      },
      select: certificateSelect,
    });

    await this.notifications.notify(certificate.doctorProfile.userId, {
      type: NotificationType.CERTIFICATE_REVOKED,
      title: 'Sertifikat bekor qilindi',
      body: dto.reason
        ? `${certificateId} raqamli sertifikat bekor qilindi. Sabab: ${dto.reason}`
        : `${certificateId} raqamli sertifikat bekor qilindi.`,
      link: '/certificates',
    });

    return revoked;
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

/** Ketma-ketlik tranzaksiyadan tashqarida ham xavfsiz — u orqaga qaytmaydi. */
async function nextSequence(
  client: Pick<PrismaService, '$queryRaw'>,
): Promise<number> {
  const [row] = await client.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('certificate_number_seq')
  `;

  return Number(row.nextval);
}
