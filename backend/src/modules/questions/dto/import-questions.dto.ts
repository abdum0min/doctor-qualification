import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { Difficulty } from 'src/generated/prisma/enums';

const toBoolean = ({ value }: { value: unknown }) =>
  value === 'true' || value === true;

export class ImportQuestionsDto {
  @ApiPropertyOptional({
    default: false,
    description:
      'Yoqilsa xatoli qatorlar tashlab ketiladi, qolganlari import qilinadi',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(toBoolean)
  skipInvalidRows?: boolean;

  @ApiPropertyOptional({
    enum: Difficulty,
    default: Difficulty.INTERMEDIATE,
    description: '`Daraja` ustuni bo`sh qatorlar uchun qo`llaniladi',
  })
  @IsOptional()
  @IsEnum(Difficulty)
  defaultDifficulty?: Difficulty;
}

export class ImportRowErrorDto {
  @ApiProperty({ example: 4, description: 'Fayldagi qator raqami' })
  row: number;

  @ApiProperty({ example: 'Savol matni bo`sh' })
  message: string;
}

export class ImportResultDto {
  @ApiProperty({ example: 120, description: 'Fayldagi savol qatorlari soni' })
  totalRows: number;

  @ApiProperty({ example: 112, description: 'Bazaga yozilgan savollar' })
  imported: number;

  @ApiProperty({
    example: 5,
    description: 'Imtihonda allaqachon mavjud bo`lgani uchun tashlanganlar',
  })
  duplicates: number;

  @ApiProperty({ example: 3, description: 'Xatoli qatorlar soni' })
  failed: number;

  @ApiProperty({ type: [ImportRowErrorDto] })
  errors: ImportRowErrorDto[];
}
