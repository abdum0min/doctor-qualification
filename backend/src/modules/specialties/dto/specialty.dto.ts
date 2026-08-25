import { ApiProperty } from '@nestjs/swagger';

export class SpecialtyDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Kardiolog' })
  name: string;

  @ApiProperty({ example: 'Yurak-qon tomir kasalliklari', nullable: true })
  description: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class AdminSpecialtyDto extends SpecialtyDto {
  @ApiProperty({
    example: 12,
    description: 'Shu yo`nalishni tanlagan shifokorlar',
  })
  doctorsCount: number;

  @ApiProperty({ example: 40, description: 'Savol bazasidagi savollar soni' })
  questionsCount: number;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  updatedAt: Date;
}
