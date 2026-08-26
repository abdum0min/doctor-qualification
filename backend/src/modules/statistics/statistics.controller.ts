import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/generated/prisma/enums';

import {
  PlatformOverviewDto,
  PlatformTrendsDto,
  PublicStatisticsDto,
  SpecialtyStatisticsDto,
} from './dto/statistics.dto';
import { StatisticsService } from './statistics.service';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Public()
  @Get('public')
  @ResponseMessage('Platform statistics')
  @ApiOperation({ summary: 'Bosh sahifa uchun umumiy raqamlar (ochiq)' })
  @ApiDataResponse(PublicStatisticsDto)
  publicSummary() {
    return this.statisticsService.publicSummary();
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('overview')
  @ResponseMessage('Platform overview')
  @ApiOperation({ summary: 'Platforma bo`yicha to`liq statistika (admin)' })
  @ApiDataResponse(PlatformOverviewDto)
  @ApiErrorResponses(401, 403)
  overview() {
    return this.statisticsService.overview();
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('trends')
  @ResponseMessage('Platform trends')
  @ApiOperation({
    summary: 'Boshqaruv paneli grafiklari uchun vaqt qatorlari (admin)',
    description:
      'Bo`sh kunlar va oylar ham nol qiymat bilan qaytariladi — grafikda ' +
      'uzilish bo`lmasligi uchun.',
  })
  @ApiDataResponse(PlatformTrendsDto)
  @ApiErrorResponses(401, 403)
  trends() {
    return this.statisticsService.trends();
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('specialties')
  @ResponseMessage('Specialty statistics')
  @ApiOperation({ summary: 'Mutaxassisliklar kesimidagi natijalar (admin)' })
  @ApiDataResponse(SpecialtyStatisticsDto, { isArray: true })
  @ApiErrorResponses(401, 403)
  bySpecialty() {
    return this.statisticsService.bySpecialty();
  }
}
