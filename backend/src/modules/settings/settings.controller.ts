import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/generated/prisma/enums';

import {
  ExamDefaultsDto,
  PlatformSettingsDto,
  UpdateSettingsDto,
} from './dto/settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Admin · Settings')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@ApiErrorResponses(401, 403)
@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ResponseMessage('Platform settings')
  @ApiOperation({
    summary: 'Platforma sozlamalari',
    description:
      'Malaka darajasi chegaralari va sertifikat raqami formati bu yerda ' +
      'o`zgartirilmaydi — ular berilgan hujjatlarga yozilgan.',
  })
  @ApiDataResponse(PlatformSettingsDto)
  find() {
    return this.settingsService.find();
  }

  @Get('exam-defaults')
  @ResponseMessage('Exam defaults')
  @ApiOperation({ summary: 'Yangi imtihon formasi uchun standart qiymatlar' })
  @ApiDataResponse(ExamDefaultsDto)
  examDefaults() {
    return this.settingsService.examDefaults();
  }

  @Patch()
  @ResponseMessage('Settings updated')
  @ApiOperation({
    summary: 'Sozlamalarni yangilash',
    description:
      'Sertifikat muddati faqat yangi beriladigan hujjatlarga ta`sir qiladi.',
  })
  @ApiDataResponse(PlatformSettingsDto)
  @ApiErrorResponses(400)
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
