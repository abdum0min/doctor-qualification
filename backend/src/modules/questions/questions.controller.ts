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

@ApiTags('Questions')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@ApiErrorResponses(401, 403)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ResponseMessage('Questions')
  @ApiOperation({ summary: 'Savollar ro`yxati — filtr va kursorli sahifalash' })
  @ApiPaginatedResponse(QuestionDto)
  findMany(@Query() query: QuestionQueryDto) {
    return this.questionsService.findMany(query);
  }

  @Get(':id')
  @ResponseMessage('Question')
  @ApiOperation({ summary: 'Bitta savol' })
  @ApiDataResponse(QuestionDto)
  @ApiErrorResponses(404)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findOne(id);
  }

  @Post()
  @ResponseMessage('Question created')
  @ApiOperation({ summary: 'Yangi savol qo`shish' })
  @ApiDataResponse(QuestionDto, { status: 201 })
  @ApiErrorResponses(400, 404)
  create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto);
  }

  @Patch(':id')
  @ResponseMessage('Question updated')
  @ApiOperation({ summary: 'Savolni tahrirlash yoki faolligini o`zgartirish' })
  @ApiDataResponse(QuestionDto)
  @ApiErrorResponses(400, 404)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, dto);
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
  @ApiErrorResponses(404)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.remove(id);
  }
}
