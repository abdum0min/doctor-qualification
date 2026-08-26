import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
  ApiPaginatedResponse,
} from 'src/common/swagger/api-response.decorator';

import {
  NotificationDto,
  NotificationsQueryDto,
  UnreadCountDto,
} from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@ApiErrorResponses(401)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ResponseMessage('Notifications')
  @ApiOperation({ summary: 'Foydalanuvchining xabarlari' })
  @ApiPaginatedResponse(NotificationDto)
  @ApiErrorResponses(400)
  list(
    @CurrentUser('id') userId: number,
    @Query() query: NotificationsQueryDto,
  ) {
    return this.notificationsService.list(userId, query);
  }

  @Get('unread-count')
  @ResponseMessage('Unread notifications')
  @ApiOperation({ summary: 'O`qilmagan xabarlar soni' })
  @ApiDataResponse(UnreadCountDto)
  countUnread(@CurrentUser('id') userId: number) {
    return this.notificationsService.countUnread(userId);
  }

  @Patch('read-all')
  @ResponseMessage('All notifications marked as read')
  @ApiOperation({ summary: 'Barchasini o`qilgan deb belgilash' })
  @ApiDataResponse(UnreadCountDto)
  markAllRead(@CurrentUser('id') userId: number) {
    return this.notificationsService.markAllRead(userId);
  }

  @Patch(':id/read')
  @ResponseMessage('Notification marked as read')
  @ApiOperation({ summary: 'Xabarni o`qilgan deb belgilash' })
  @ApiDataResponse(NotificationDto)
  @ApiErrorResponses(404)
  markRead(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markRead(userId, id);
  }
}
