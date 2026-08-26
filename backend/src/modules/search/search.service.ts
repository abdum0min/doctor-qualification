import { Injectable } from '@nestjs/common';

import { AuthenticatedUser } from 'src/common/types/authenticated-user.type';
import { Prisma } from 'src/generated/prisma/client';
import { UserRole } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import {
  SearchCertificateDto,
  SearchDoctorDto,
  SearchExamDto,
  SearchResultDto,
  SearchSpecialtyDto,
} from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Har bir bo'limdan cheklangan sondagi eng mos yozuv qaytariladi — to'liq
   * ro'yxat o'z sahifasida filtrlanadi.
   *
   * Natija rolga qarab toraytiriladi: shifokor faqat faol imtihonlarni va
   * o'z sertifikatlarini ko'radi, shifokorlar ro'yxati esa unga umuman
   * ochilmaydi.
   */
  async search(
    user: AuthenticatedUser,
    query: string,
    limit: number,
  ): Promise<SearchResultDto> {
    const contains: Prisma.StringFilter = {
      contains: query,
      mode: 'insensitive',
    };
    const isAdmin = user.role === UserRole.ADMIN;

    const [exams, specialties, doctors, certificates] = await Promise.all([
      this.findExams(contains, limit, isAdmin),
      this.findSpecialties(contains, limit, isAdmin),
      isAdmin ? this.findDoctors(contains, limit) : [],
      this.findCertificates(user, contains, limit, isAdmin),
    ]);

    return { exams, specialties, doctors, certificates };
  }

  private findExams(
    contains: Prisma.StringFilter,
    take: number,
    isAdmin: boolean,
  ): Promise<SearchExamDto[]> {
    return this.prisma.exam.findMany({
      where: {
        title: contains,
        ...(isAdmin ? {} : { isActive: true, specialty: { isActive: true } }),
      },
      select: {
        id: true,
        title: true,
        questionCount: true,
        isActive: true,
        specialty: { select: { id: true, name: true } },
      },
      orderBy: { title: 'asc' },
      take,
    });
  }

  private findSpecialties(
    contains: Prisma.StringFilter,
    take: number,
    isAdmin: boolean,
  ): Promise<SearchSpecialtyDto[]> {
    return this.prisma.specialty.findMany({
      where: { name: contains, ...(isAdmin ? {} : { isActive: true }) },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take,
    });
  }

  private async findDoctors(
    contains: Prisma.StringFilter,
    take: number,
  ): Promise<SearchDoctorDto[]> {
    const profiles = await this.prisma.doctorProfile.findMany({
      where: {
        OR: [{ user: { fullname: contains } }, { workplace: contains }],
      },
      select: {
        id: true,
        workplace: true,
        user: { select: { fullname: true } },
        specialty: { select: { name: true } },
      },
      orderBy: { user: { fullname: 'asc' } },
      take,
    });

    return profiles.map((profile) => ({
      id: profile.id,
      fullname: profile.user.fullname,
      specialtyName: profile.specialty?.name ?? null,
      workplace: profile.workplace,
    }));
  }

  /**
   * Sertifikat raqami bo'yicha qidiruv — asosiy foydalanish stsenariysi.
   * Admin qo'shimcha ravishda shifokor ismi bo'yicha ham topa oladi.
   */
  private async findCertificates(
    user: AuthenticatedUser,
    contains: Prisma.StringFilter,
    take: number,
    isAdmin: boolean,
  ): Promise<SearchCertificateDto[]> {
    const ownerFilter = isAdmin
      ? {}
      : { doctorProfile: { is: { userId: user.id } } };

    return this.prisma.certificate.findMany({
      where: {
        ...ownerFilter,
        OR: [
          { certificateId: contains },
          { examTitle: contains },
          ...(isAdmin ? [{ doctorFullname: contains }] : []),
        ],
      },
      select: {
        certificateId: true,
        doctorFullname: true,
        examTitle: true,
        qualification: true,
        status: true,
      },
      orderBy: { issuedAt: 'desc' },
      take,
    });
  }
}
