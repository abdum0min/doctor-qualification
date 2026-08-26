import { BadRequestException, Injectable } from '@nestjs/common';

import { RankingConfig } from 'src/domain/ranking';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import {
  ExamDefaultsDto,
  PlatformSettingsDto,
  UpdateSettingsDto,
} from './dto/settings.dto';

/** Sozlamalar yagona qatorda saqlanadi. */
const SETTINGS_ID = 1;

const SETTINGS_SELECT = {
  averageScoreWeight: true,
  bestScoreWeight: true,
  volumeWeight: true,
  passRateWeight: true,
  volumeTargetAttempts: true,
  certificateValidityMonths: true,
  defaultQuestionCount: true,
  defaultTimeLimitMinutes: true,
  defaultPassingScore: true,
  updatedAt: true,
} as const;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Qator migratsiyada yaratilmaydi — birinchi murojaatda standart qiymatlar
   * bilan paydo bo'ladi, shuning uchun bo'sh bazada ham ishlaydi.
   */
  find(): Promise<PlatformSettingsDto> {
    return this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
      select: SETTINGS_SELECT,
    });
  }

  async update(dto: UpdateSettingsDto): Promise<PlatformSettingsDto> {
    const next = { ...(await this.find()), ...dto };

    const totalWeight =
      next.averageScoreWeight +
      next.bestScoreWeight +
      next.volumeWeight +
      next.passRateWeight;

    // Hamma vazn nol bo'lsa reyting bali hisoblanmay qoladi.
    if (totalWeight <= 0) {
      throw new BadRequestException(
        'At least one ranking weight must be greater than zero',
      );
    }

    return this.prisma.platformSettings.update({
      where: { id: SETTINGS_ID },
      data: dto,
      select: SETTINGS_SELECT,
    });
  }

  /** Reyting moduli faqat shu qismini oladi. */
  async rankingConfig(): Promise<RankingConfig> {
    const settings = await this.find();

    return {
      weights: {
        averageScore: settings.averageScoreWeight,
        bestScore: settings.bestScoreWeight,
        volume: settings.volumeWeight,
        passRate: settings.passRateWeight,
      },
      volumeTargetAttempts: settings.volumeTargetAttempts,
    };
  }

  async certificateValidityMonths(): Promise<number> {
    return (await this.find()).certificateValidityMonths;
  }

  async examDefaults(): Promise<ExamDefaultsDto> {
    const settings = await this.find();

    return {
      questionCount: settings.defaultQuestionCount,
      timeLimitMinutes: settings.defaultTimeLimitMinutes,
      passingScore: settings.defaultPassingScore,
    };
  }
}
