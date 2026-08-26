import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
  ApiPaginatedResponse,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/generated/prisma/enums';

import { AnnouncementsService } from './announcements.service';
import {
  AnnouncementDto,
  AnnouncementsQueryDto,
  AudiencePreviewDto,
  AudienceQueryDto,
  SendAnnouncementDto,
} from './dto/announcement.dto';

@ApiTags('Admin · Announcements')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@ApiErrorResponses(401, 403)
@Controller('admin/announcements')
export class AdminAnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ResponseMessage('Announcements')
  @ApiOperation({ summary: 'Yuborilgan xabarlar tarixi' })
  @ApiPaginatedResponse(AnnouncementDto)
  @ApiErrorResponses(400)
  list(@Query() query: AnnouncementsQueryDto) {
    return this.announcementsService.list(query);
  }

  @Get('audience')
  @ResponseMessage('Audience preview')
  @ApiOperation({
    summary: 'Tanlangan filtr bo`yicha qabul qiluvchilar soni',
    description: 'Yuborishdan oldin xabar kimga ketishini ko`rsatadi.',
  })
  @ApiDataResponse(AudiencePreviewDto)
  @ApiErrorResponses(400)
  previewAudience(@Query() query: AudienceQueryDto) {
    return this.announcementsService.previewAudience(query);
  }

  @Post()
  @ResponseMessage('Announcement sent')
  @ApiOperation({ summary: 'Shifokorlarga ommaviy xabar yuborish' })
  @ApiDataResponse(AnnouncementDto, { status: 201 })
  @ApiErrorResponses(400)
  send(@CurrentUser('id') adminId: number, @Body() dto: SendAnnouncementDto) {
    return this.announcementsService.send(adminId, dto);
  }
}
