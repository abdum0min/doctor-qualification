import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SpecialtiesService } from 'src/modules/specialties/specialties.service';

import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

export interface DoctorSpecialtyView {
  id: number;
  name: string;
}

export interface DoctorProfileView {
  id: number;
  userId: number;
  fullname: string;
  email: string;
  specialty: DoctorSpecialtyView | null;
  phone: string | null;
  workplace: string | null;
  experienceYears: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const profileSelect = {
  id: true,
  userId: true,
  phone: true,
  workplace: true,
  experienceYears: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { fullname: true, email: true } },
  specialty: { select: { id: true, name: true } },
} as const;

interface ProfileRow {
  id: number;
  userId: number;
  phone: string | null;
  workplace: string | null;
  experienceYears: number | null;
  createdAt: Date;
  updatedAt: Date;
  user: { fullname: string; email: string };
  specialty: DoctorSpecialtyView | null;
}

@Injectable()
export class DoctorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly specialtiesService: SpecialtiesService,
  ) {}

  async findOwnProfile(userId: number): Promise<DoctorProfileView> {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      select: profileSelect,
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    return toView(profile);
  }

  async updateOwnProfile(
    userId: number,
    dto: UpdateDoctorProfileDto,
  ): Promise<DoctorProfileView> {
    const { fullname, specialtyId, ...profileFields } = dto;

    if (specialtyId) {
      await this.specialtiesService.ensureActive(specialtyId);
    }

    const profile = await this.prisma.doctorProfile.update({
      where: { userId },
      data: {
        ...profileFields,
        ...(fullname ? { user: { update: { fullname } } } : {}),
        ...(specialtyId === undefined
          ? {}
          : { specialty: specialtyRelation(specialtyId) }),
      },
      select: profileSelect,
    });

    return toView(profile);
  }
}

function specialtyRelation(specialtyId: number | null) {
  return specialtyId === null
    ? { disconnect: true }
    : { connect: { id: specialtyId } };
}

function toView({ user, ...rest }: ProfileRow): DoctorProfileView {
  return { ...rest, fullname: user.fullname, email: user.email };
}
