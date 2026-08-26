import { BadRequestException, Injectable } from '@nestjs/common';

import { Paginated } from 'src/common/interfaces/api-response.interface';
import { buildPaginated, toSkipTake } from 'src/common/utils/pagination.util';
import { Prisma } from 'src/generated/prisma/client';
import {
  AttemptStatus,
  NotificationType,
  QualificationLevel,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import {
  AnnouncementDto,
  AnnouncementsQueryDto,
  AudienceFilterDto,
  AudiencePreviewDto,
  SendAnnouncementDto,
} from './dto/announcement.dto';

const EVERYONE = 'Barcha shifokorlar';

const QUALIFICATION_LABEL: Record<QualificationLevel, string> = {
  [QualificationLevel.BEGINNER]: 'Boshlang`ich daraja',
  [QualificationLevel.INTERMEDIATE]: 'O`rta daraja',
  [QualificationLevel.GOOD]: 'Yaxshi daraja',
  [QualificationLevel.HIGH]: 'Yuqori daraja',
  [QualificationLevel.EXPERT]: 'Ekspert daraja',
};

const ANNOUNCEMENT_SELECT = {
  id: true,
  title: true,
  body: true,
  link: true,
  audience: true,
  recipientCount: true,
  createdAt: true,
  sentBy: { select: { fullname: true } },
} satisfies Prisma.AnnouncementSelect;

type AnnouncementRow = Prisma.AnnouncementGetPayload<{
  select: typeof ANNOUNCEMENT_SELECT;
}>;

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Yuborishdan oldin nechta shifokor xabarni olishini ko'rsatadi. */
  async previewAudience(
    filter: AudienceFilterDto,
  ): Promise<AudiencePreviewDto> {
    const [recipientCount, audience] = await Promise.all([
      this.prisma.doctorProfile.count({ where: buildAudienceWhere(filter) }),
      this.describeAudience(filter),
    ]);

    return { recipientCount, audience };
  }

  /**
   * Xabar tarixga yoziladi va har bir qabul qiluvchiga alohida bildirishnoma
   * yaratiladi — ikkalasi bitta tranzaksiyada, shunda tarixdagi qabul
   * qiluvchilar soni har doim haqiqiy yozuvlarga mos keladi.
   */
  async send(
    sentById: number,
    dto: SendAnnouncementDto,
  ): Promise<AnnouncementDto> {
    const recipients = await this.prisma.doctorProfile.findMany({
      where: buildAudienceWhere(dto),
      select: { userId: true },
    });

    if (recipients.length === 0) {
      throw new BadRequestException(
        'No active doctor matches the selected audience',
      );
    }

    const audience = await this.describeAudience(dto);

    const announcement = await this.prisma.$transaction(async (tx) => {
      const created = await tx.announcement.create({
        data: {
          title: dto.title,
          body: dto.body,
          link: dto.link ?? null,
          audience,
          recipientCount: recipients.length,
          sentById,
        },
        select: ANNOUNCEMENT_SELECT,
      });

      await tx.notification.createMany({
        data: recipients.map((recipient) => ({
          userId: recipient.userId,
          type: NotificationType.SYSTEM,
          title: dto.title,
          body: dto.body,
          link: dto.link ?? null,
        })),
      });

      return created;
    });

    return toAnnouncementDto(announcement);
  }

  async list(
    query: AnnouncementsQueryDto,
  ): Promise<Paginated<AnnouncementDto>> {
    const where: Prisma.AnnouncementWhereInput = query.search
      ? { title: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.announcement.findMany({
        where,
        select: ANNOUNCEMENT_SELECT,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return buildPaginated(rows.map(toAnnouncementDto), total, query);
  }

  private async describeAudience(filter: AudienceFilterDto): Promise<string> {
    const specialty = filter.specialtyId
      ? await this.prisma.specialty.findUnique({
          where: { id: filter.specialtyId },
          select: { name: true },
        })
      : null;

    const parts = [
      specialty?.name,
      filter.qualification
        ? `${QUALIFICATION_LABEL[filter.qualification]} olganlar`
        : undefined,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ').slice(0, 200) : EVERYONE;
  }
}

/** Bloklangan hisoblar xabar olmaydi. */
function buildAudienceWhere(
  filter: AudienceFilterDto,
): Prisma.DoctorProfileWhereInput {
  return {
    user: { isActive: true },
    ...(filter.specialtyId ? { specialtyId: filter.specialtyId } : {}),
    ...(filter.qualification
      ? {
          attempts: {
            some: {
              status: AttemptStatus.SUBMITTED,
              qualification: filter.qualification,
            },
          },
        }
      : {}),
  };
}

function toAnnouncementDto({
  sentBy,
  ...announcement
}: AnnouncementRow): AnnouncementDto {
  return { ...announcement, sentBy: sentBy?.fullname ?? null };
}
