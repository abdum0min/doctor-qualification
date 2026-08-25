import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
  ApiPaginatedResponse,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/generated/prisma/enums';

import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionQueryDto } from './dto/question-query.dto';
import { QuestionDto } from './dto/question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionsService } from './questions.service';

/**
 * Savollar imtihonning ichida boshqariladi — shuning uchun barcha yo'llar
 * `examId` ostida turadi va savol boshqa imtihonga tegishli bo'lsa topilmaydi.
 */
@ApiTags('Admin · Questions')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@ApiErrorResponses(401, 403, 404)
@Controller('admin/exams/:examId/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ResponseMessage('Questions')
  @ApiOperation({ summary: 'Imtihon savollari' })
  @ApiPaginatedResponse(QuestionDto)
  findMany(
    @Param('examId', ParseIntPipe) examId: number,
    @Query() query: QuestionQueryDto,
  ) {
    return this.questionsService.findMany(examId, query);
  }

  @Get(':id')
  @ResponseMessage('Question')
  @ApiOperation({ summary: 'Bitta savol' })
  @ApiDataResponse(QuestionDto)
  findOne(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.questionsService.findOne(examId, id);
  }

  @Post()
  @ResponseMessage('Question created')
  @ApiOperation({ summary: 'Imtihonga savol qo`shish' })
  @ApiDataResponse(QuestionDto, { status: 201 })
  @ApiErrorResponses(400)
  create(
    @Param('examId', ParseIntPipe) examId: number,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionsService.create(examId, dto);
  }

  @Patch(':id')
  @ResponseMessage('Question updated')
  @ApiOperation({ summary: 'Savolni tahrirlash yoki faolligini o`zgartirish' })
  @ApiDataResponse(QuestionDto)
  @ApiErrorResponses(400)
  update(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(examId, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Question deleted')
  @ApiOperation({
    summary: 'Savolni o`chirish',
    description:
      'Topshirilgan urinishlar savol matnini o`z ichida saqlaydi, shuning uchun ' +
      'o`chirish tarixiy natijalarga ta`sir qilmaydi.',
  })
  @ApiErrorResponses(400)
  remove(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.questionsService.remove(examId, id);
  }
}
