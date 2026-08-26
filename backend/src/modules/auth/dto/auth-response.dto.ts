import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserRole } from 'src/generated/prisma/enums';

/** Tashqariga chiqadigan foydalanuvchi — parol hech qachon bu yerda bo'lmaydi. */
export class UserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  fullname: string;

  @ApiProperty({ example: 'john@mail.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.DOCTOR })
  role: UserRole;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ nullable: true, example: '/uploads/avatars/3f2b.jpg' })
  avatarUrl: string | null;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  updatedAt: Date;
}

export class AuthResultDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: '1d' })
  expiresIn: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
