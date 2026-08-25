import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateSpecialtyDto {
  @ApiProperty({ example: 'Kardiolog', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(trim)
  name: string;

  @ApiPropertyOptional({
    example: 'Yurak-qon tomir kasalliklari',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(trim)
  description?: string | null;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
