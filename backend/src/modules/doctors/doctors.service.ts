import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/modules/prisma/prisma.service';

import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

export interface DoctorProfileView {
  id: number;
  userId: number;
  fullname: string;
  email: string;
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
}

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const { fullname, ...profileFields } = dto;

    const profile = await this.prisma.doctorProfile.update({
      where: { userId },
      data: {
        ...profileFields,
        ...(fullname ? { user: { update: { fullname } } } : {}),
      },
      select: profileSelect,
    });

    return toView(profile);
  }
}

function toView({ user, ...rest }: ProfileRow): DoctorProfileView {
  return { ...rest, fullname: user.fullname, email: user.email };
}
