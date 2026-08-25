import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RevokeCertificateDto {
  @ApiPropertyOptional({
    example: 'Imtihon natijasi qayta ko`rib chiqildi',
    description: 'Ommaviy tekshiruvda ko`rsatilmaydi — faqat ichki yozuv',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  reason?: string;
}
