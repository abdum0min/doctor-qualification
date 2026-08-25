import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
  ApiPaginatedResponse,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/generated/prisma/enums';

import { AdminAttemptsService } from './admin-attempts.service';
import { AdminAttemptQueryDto } from './dto/admin-attempt-query.dto';
import {
  AdminAttemptDetailDto,
  AdminAttemptDto,
} from './dto/admin-attempt.dto';

@ApiTags('Admin · Attempts')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@ApiErrorResponses(401, 403)
@Controller('admin/attempts')
export class AdminAttemptsController {
  constructor(private readonly adminAttemptsService: AdminAttemptsService) {}

  @Get()
  @ResponseMessage('Attempts')
  @ApiOperation({ summary: 'Barcha imtihon urinishlari — filtr bilan' })
  @ApiPaginatedResponse(AdminAttemptDto)
  findMany(@Query() query: AdminAttemptQueryDto) {
    return this.adminAttemptsService.findMany(query);
  }

  @Get(':id')
  @ResponseMessage('Attempt')
  @ApiOperation({ summary: 'Urinish natijasi — savol va javoblari bilan' })
  @ApiDataResponse(AdminAttemptDetailDto)
  @ApiErrorResponses(404)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminAttemptsService.findOne(id);
  }
}
