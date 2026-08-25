import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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

import { AttemptsService } from './attempts.service';
import { AttemptHistoryQueryDto } from './dto/attempt-history-query.dto';
import {
  AttemptDto,
  AttemptQuestionDto,
  AttemptSummaryDto,
} from './dto/attempt.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { StartAttemptDto } from './dto/start-attempt.dto';

@ApiTags('Attempts')
@ApiBearerAuth('access-token')
@Roles(UserRole.DOCTOR)
@ApiErrorResponses(401, 403)
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  @ResponseMessage('Attempt started')
  @ApiOperation({
    summary: 'Imtihonni boshlash',
    description:
      'Savollar serverda tanlanadi va urinish nusxasiga yoziladi. Ayni imtihon ' +
      'bo`yicha tugallanmagan urinish bo`lsa, o`sha urinish qaytariladi.',
  })
  @ApiDataResponse(AttemptDto, { status: 201 })
  @ApiErrorResponses(400, 404, 409)
  start(@CurrentUser('id') userId: number, @Body() dto: StartAttemptDto) {
    return this.attemptsService.start(userId, dto.examId);
  }

  @Get()
  @ResponseMessage('Attempt history')
  @ApiOperation({ summary: 'Shifokorning oldingi urinishlari' })
  @ApiPaginatedResponse(AttemptSummaryDto)
  findHistory(
    @CurrentUser('id') userId: number,
    @Query() query: AttemptHistoryQueryDto,
  ) {
    return this.attemptsService.findHistory(userId, query);
  }

  @Get(':id')
  @ResponseMessage('Attempt')
  @ApiOperation({
    summary: 'Urinish holati',
    description:
      'Davom etayotgan urinishda to`g`ri javoblar yashirin bo`ladi; ' +
      'yakunlangandan keyin tahlil uchun ochiladi.',
  })
  @ApiDataResponse(AttemptDto)
  @ApiErrorResponses(404)
  findOne(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.attemptsService.findOne(userId, id);
  }

  @Patch(':id/answers')
  @ResponseMessage('Answer saved')
  @ApiOperation({ summary: 'Bitta javobni saqlash (avtosaqlash)' })
  @ApiDataResponse(AttemptQuestionDto)
  @ApiErrorResponses(400, 404, 409)
  saveAnswer(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveAnswerDto,
  ) {
    return this.attemptsService.saveAnswer(userId, id, dto);
  }

  @Post(':id/submit')
  @HttpCode(200)
  @ResponseMessage('Attempt submitted')
  @ApiOperation({
    summary: 'Imtihonni yakunlash',
    description:
      'Natija butunlay serverda hisoblanadi — so`rov tanasida ball yoki ' +
      'to`g`ri javoblar soni qabul qilinmaydi.',
  })
  @ApiDataResponse(AttemptDto)
  @ApiErrorResponses(404, 409)
  submit(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.attemptsService.submit(userId, id);
  }
}
