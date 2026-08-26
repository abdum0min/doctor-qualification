import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
} from 'src/common/swagger/api-response.decorator';
import type { AuthenticatedUser } from 'src/common/types/authenticated-user.type';

import { SearchQueryDto, SearchResultDto } from './dto/search.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth('access-token')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ResponseMessage('Search results')
  @ApiOperation({
    summary: 'Global qidiruv',
    description:
      'Imtihonlar, mutaxassisliklar va sertifikatlar bo`yicha qidiradi. ' +
      'Shifokorlar ro`yxati faqat administratorga ochiladi, shifokor esa ' +
      'faqat o`z sertifikatlarini topadi.',
  })
  @ApiDataResponse(SearchResultDto)
  @ApiErrorResponses(400, 401)
  search(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SearchQueryDto,
  ) {
    return this.searchService.search(user, query.q, query.limit);
  }
}
