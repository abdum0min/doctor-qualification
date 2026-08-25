import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { SpecialtyQueryDto } from './dto/specialty-query.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

export interface SpecialtyView {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface AdminSpecialtyView extends SpecialtyView {
  doctorsCount: number;
  questionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const publicSelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
} as const;

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prisma: PrismaService) {}

  findActive(query: SpecialtyQueryDto): Promise<SpecialtyView[]> {
    return this.prisma.specialty.findMany({
      where: { isActive: true, ...searchFilter(query.search) },
      select: publicSelect,
      orderBy: { name: 'asc' },
    });
  }

  async findAll(query: SpecialtyQueryDto): Promise<AdminSpecialtyView[]> {
    const specialties = await this.prisma.specialty.findMany({
      where: searchFilter(query.search),
      select: {
        ...publicSelect,
        createdAt: true,
        updatedAt: true,
        _count: { select: { doctorProfiles: true, questions: true } },
      },
      orderBy: { name: 'asc' },
    });

    return specialties.map(({ _count, ...specialty }) => ({
      ...specialty,
      doctorsCount: _count.doctorProfiles,
      questionsCount: _count.questions,
    }));
  }

  create(dto: CreateSpecialtyDto): Promise<SpecialtyView> {
    return this.prisma.specialty.create({ data: dto, select: publicSelect });
  }

  update(id: number, dto: UpdateSpecialtyDto): Promise<SpecialtyView> {
    return this.prisma.specialty.update({
      where: { id },
      data: dto,
      select: publicSelect,
    });
  }

  /** Imtihon/savol bazasi shu yozuvga bog'langani uchun faqat faol holati tekshiriladi. */
  async ensureActive(id: number): Promise<void> {
    const specialty = await this.prisma.specialty.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!specialty?.isActive) {
      throw new NotFoundException('Specialty not found or inactive');
    }
  }
}

function searchFilter(search?: string): Prisma.SpecialtyWhereInput {
  return search ? { name: { contains: search, mode: 'insensitive' } } : {};
}
