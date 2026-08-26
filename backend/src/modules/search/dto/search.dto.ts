import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import {
  CertificateStatus,
  QualificationLevel,
} from 'src/generated/prisma/enums';

export const MAX_SEARCH_LIMIT = 10;

export class SearchQueryDto {
  @ApiProperty({ example: 'kardio', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  q: string;

  @ApiPropertyOptional({ default: 5, minimum: 1, maximum: MAX_SEARCH_LIMIT })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_SEARCH_LIMIT)
  limit: number = 5;
}

export class SearchSpecialtyDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'Kardiolog' })
  name: string;
}

export class SearchExamDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  title: string;

  @ApiProperty({ example: 20 })
  questionCount: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: SearchSpecialtyDto })
  specialty: SearchSpecialtyDto;
}

export class SearchDoctorDto {
  @ApiProperty({ example: 12, description: 'Shifokor profili identifikatori' })
  id: number;

  @ApiProperty({ example: 'Nilufar Karimova' })
  fullname: string;

  @ApiPropertyOptional({ nullable: true, example: 'Kardiolog' })
  specialtyName: string | null;

  @ApiPropertyOptional({ nullable: true, example: '1-sonli shifoxona' })
  workplace: string | null;
}

export class SearchCertificateDto {
  @ApiProperty({ example: 'DOC-2026-000123' })
  certificateId: string;

  @ApiProperty({ example: 'Nilufar Karimova' })
  doctorFullname: string;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  examTitle: string;

  @ApiProperty({ enum: QualificationLevel })
  qualification: QualificationLevel;

  @ApiProperty({ enum: CertificateStatus })
  status: CertificateStatus;
}

export class SearchResultDto {
  @ApiProperty({ type: [SearchExamDto] })
  exams: SearchExamDto[];

  @ApiProperty({ type: [SearchSpecialtyDto] })
  specialties: SearchSpecialtyDto[];

  @ApiProperty({
    type: [SearchDoctorDto],
    description: 'Faqat administrator uchun to`ldiriladi',
  })
  doctors: SearchDoctorDto[];

  @ApiProperty({
    type: [SearchCertificateDto],
    description: 'Shifokor faqat o`z sertifikatlarini ko`radi',
  })
  certificates: SearchCertificateDto[];
}
