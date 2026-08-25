import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

export enum ExamStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export class ExamQueryDto {
  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  specialtyId?: number;

  @ApiPropertyOptional({
    enum: ExamStatus,
    description: 'Faqat admin ro`yxatida',
  })
  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;
}
