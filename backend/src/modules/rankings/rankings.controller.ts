import { Controller, Get, Query } from '@nestjs/common';
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

import { MyRankingDto, RankingRowDto } from './dto/ranking.dto';
import { RankingsQueryDto } from './dto/rankings-query.dto';
import { RankingsService } from './rankings.service';

@ApiTags('Rankings')
@ApiBearerAuth('access-token')
@ApiErrorResponses(401)
@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get()
  @ResponseMessage('Rankings')
  @ApiOperation({
    summary: 'Shifokorlar reytingi',
    description:
      'Ball — o`rtacha natija, eng yuqori natija, urinishlar hajmi va ' +
      'o`tish ulushining vaznli o`rtachasi.',
  })
  @ApiPaginatedResponse(RankingRowDto)
  findMany(@Query() query: RankingsQueryDto) {
    return this.rankingsService.findMany(query);
  }

  @Get('top')
  @ResponseMessage('Top doctors')
  @ApiOperation({
    summary: 'Eng yuqori natijali shifokorlar',
    description: 'Nechta qator qaytishini `limit` belgilaydi (standart 10).',
  })
  @ApiDataResponse(RankingRowDto, { isArray: true })
  findTop(@Query() query: RankingsQueryDto) {
    return this.rankingsService.findTop(query, query.limit);
  }

  @Roles(UserRole.DOCTOR)
  @Get('me')
  @ResponseMessage('My ranking')
  @ApiOperation({ summary: 'Shifokorning reytingdagi o`z o`rni' })
  @ApiDataResponse(MyRankingDto)
  @ApiErrorResponses(403, 404)
  findOwn(@CurrentUser('id') userId: number, @Query() query: RankingsQueryDto) {
    return this.rankingsService.findOwn(userId, query);
  }
}
