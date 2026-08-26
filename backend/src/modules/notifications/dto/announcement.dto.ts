import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { PageQueryDto } from 'src/common/dto/pagination-query.dto';
import { QualificationLevel } from 'src/generated/prisma/enums';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/**
 * Xabarni kim olishini belgilaydigan filtr. Barcha maydonlar ixtiyoriy —
 * hech biri berilmasa xabar barcha faol shifokorlarga ketadi.
 */
export class AudienceFilterDto {
  @ApiPropertyOptional({ example: 2, description: 'Mutaxassislik' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  specialtyId?: number;

  @ApiPropertyOptional({
    enum: QualificationLevel,
    description: 'Shifokorning eng yuqori malaka darajasi',
  })
  @IsOptional()
  @IsEnum(QualificationLevel)
  qualification?: QualificationLevel;
}

export class AudienceQueryDto extends AudienceFilterDto {}

export class AnnouncementsQueryDto extends PickType(PageQueryDto, [
  'page',
  'limit',
  'search',
] as const) {}

export class SendAnnouncementDto extends AudienceFilterDto {
  @ApiProperty({
    example: 'Yangi attestatsiya davri boshlandi',
    maxLength: 200,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @Transform(trim)
  title: string;

  @ApiProperty({
    example:
      'Sentyabr oyida barcha yo`nalishlar bo`yicha yangi imtihonlar ochiladi.',
    maxLength: 500,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @Transform(trim)
  body: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '/exams',
    description: 'Ilova ichidagi nisbiy manzil',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() ? value.trim() : null,
  )
  link?: string | null;
}

export class AudiencePreviewDto {
  @ApiProperty({
    example: 128,
    description: 'Xabarni oladigan shifokorlar soni',
  })
  recipientCount: number;

  @ApiProperty({ example: 'Kardiolog · Yuqori daraja' })
  audience: string;
}

export class AnnouncementDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: 'Yangi attestatsiya davri boshlandi' })
  title: string;

  @ApiProperty({ example: 'Sentyabr oyida yangi imtihonlar ochiladi.' })
  body: string;

  @ApiPropertyOptional({ nullable: true, example: '/exams' })
  link: string | null;

  @ApiProperty({ example: 'Barcha shifokorlar' })
  audience: string;

  @ApiProperty({ example: 128 })
  recipientCount: number;

  @ApiPropertyOptional({ nullable: true, example: 'Platforma administratori' })
  sentBy: string | null;

  @ApiProperty({ example: '2026-08-26T10:00:00.000Z' })
  createdAt: Date;
}
