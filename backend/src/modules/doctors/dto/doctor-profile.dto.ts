import { ApiProperty } from '@nestjs/swagger';

class DoctorSpecialtyDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Kardiolog' })
  name: string;
}

export class DoctorProfileDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 12 })
  userId: number;

  @ApiProperty({ example: 'Abdullayev Anvar Anvarovich' })
  fullname: string;

  @ApiProperty({ example: 'anvar@mail.com' })
  email: string;

  @ApiProperty({ example: '/uploads/avatars/3f2b.jpg', nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ type: DoctorSpecialtyDto, nullable: true })
  specialty: DoctorSpecialtyDto | null;

  @ApiProperty({ example: '+998901234567', nullable: true })
  phone: string | null;

  @ApiProperty({ example: '1-sonli shahar shifoxonasi', nullable: true })
  workplace: string | null;

  @ApiProperty({ example: 8, nullable: true })
  experienceYears: number | null;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  updatedAt: Date;
}
