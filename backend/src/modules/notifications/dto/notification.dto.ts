import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

import { PageQueryDto } from 'src/common/dto/pagination-query.dto';
import { NotificationType } from 'src/generated/prisma/enums';

export class NotificationsQueryDto extends PickType(PageQueryDto, [
  'page',
  'limit',
] as const) {
  @ApiPropertyOptional({ description: 'Faqat o`qilmagan xabarlar' })
  @IsOptional()
  @IsBoolean()
  @Transform(
    ({ value }: { value: unknown }) => value === 'true' || value === true,
  )
  unreadOnly?: boolean;
}

export class NotificationDto {
  @ApiProperty({ example: 41 })
  id: number;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ example: 'Yangi imtihon: Kardiologiya' })
  title: string;

  @ApiProperty({ example: 'Kardiolog yo`nalishida yangi imtihon ochildi.' })
  body: string;

  @ApiPropertyOptional({ nullable: true, example: '/exams' })
  link: string | null;

  @ApiPropertyOptional({ nullable: true })
  readAt: Date | null;

  @ApiProperty({ example: '2026-08-26T10:00:00.000Z' })
  createdAt: Date;
}

export class UnreadCountDto {
  @ApiProperty({ example: 3 })
  unread: number;
}
