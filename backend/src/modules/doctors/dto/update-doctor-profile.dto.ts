import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/**
 * `null` — maydonni tozalash, `undefined` (yuborilmagan) — tegmaslik.
 * `@IsOptional()` ikkalasini ham validatsiyadan o'tkazib yuboradi.
 */
export class UpdateDoctorProfileDto {
  @ApiPropertyOptional({ example: 'Abdullayev Anvar Anvarovich' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Transform(trim)
  fullname?: string;

  @ApiPropertyOptional({ example: '+998901234567', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Matches(/^\+?[\d\s()-]{7,}$/, { message: 'phone format is invalid' })
  @Transform(trim)
  phone?: string | null;

  @ApiPropertyOptional({ example: '1-sonli shahar shifoxonasi', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(trim)
  workplace?: string | null;

  @ApiPropertyOptional({ example: 8, minimum: 0, maximum: 70, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(70)
  experienceYears?: number | null;
}
