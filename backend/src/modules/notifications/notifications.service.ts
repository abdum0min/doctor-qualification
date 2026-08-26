import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { Paginated } from 'src/common/interfaces/api-response.interface';
import { buildPaginated, toSkipTake } from 'src/common/utils/pagination.util';
import { Prisma } from 'src/generated/prisma/client';
import { NotificationType } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import {
  NotificationDto,
  NotificationsQueryDto,
  UnreadCountDto,
} from './dto/notification.dto';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
}

const NOTIFICATION_SELECT = {
  id: true,
  type: true,
  title: true,
  body: true,
  link: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Xabar yozish asosiy amaliyotni (imtihon faollashtirish, sertifikat berish)
   * hech qachon to'xtatmasligi kerak — shuning uchun xatolik faqat jurnalga
   * yoziladi va yuqoriga uzatilmaydi.
   */
  async notify(userId: number, payload: NotificationPayload): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: { userId, ...payload, link: payload.link ?? null },
      });
    } catch (error) {
      this.logger.warn(
        `Could not notify user ${userId}: ${(error as Error).message}`,
      );
    }
  }

  /** Imtihon nashr qilinganda o'nlab shifokorga bitta so'rovda yoziladi. */
  async notifyMany(
    userIds: number[],
    payload: NotificationPayload,
  ): Promise<number> {
    if (userIds.length === 0) {
      return 0;
    }

    try {
      const result = await this.prisma.notification.createMany({
        data: userIds.map((userId) => ({
          userId,
          ...payload,
          link: payload.link ?? null,
        })),
      });

      return result.count;
    } catch (error) {
      this.logger.warn(
        `Could not notify ${userIds.length} users: ${(error as Error).message}`,
      );

      return 0;
    }
  }

  /** Bloklangan hisoblar xabar olmaydi. */
  async activeUserIdsBySpecialty(specialtyId: number): Promise<number[]> {
    const profiles = await this.prisma.doctorProfile.findMany({
      where: { specialtyId, user: { isActive: true } },
      select: { userId: true },
    });

    return profiles.map((profile) => profile.userId);
  }

  async list(
    userId: number,
    query: NotificationsQueryDto,
  ): Promise<Paginated<NotificationDto>> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        select: NOTIFICATION_SELECT,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.notification.count({ where }),
    ]);

    return buildPaginated(items, total, query);
  }

  async countUnread(userId: number): Promise<UnreadCountDto> {
    return {
      unread: await this.prisma.notification.count({
        where: { userId, readAt: null },
      }),
    };
  }

  /**
   * Faqat token egasining xabari topiladi — boshqa foydalanuvchining
   * xabarini o'qilgan deb belgilab bo'lmaydi.
   */
  async markRead(userId: number, id: number): Promise<NotificationDto> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
      select: { id: true, readAt: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      // Qayta bosilganda birinchi o'qilgan vaqt saqlanib qoladi.
      data: { readAt: notification.readAt ?? new Date() },
      select: NOTIFICATION_SELECT,
    });
  }

  async markAllRead(userId: number): Promise<UnreadCountDto> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return { unread: 0 };
  }
}
