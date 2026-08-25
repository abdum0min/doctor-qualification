import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/generated/prisma/enums';

import { CreateExamDto } from './dto/create-exam.dto';
import { ExamQueryDto } from './dto/exam-query.dto';
import { AdminExamDto, ExamDto } from './dto/exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamsService } from './exams.service';

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Public()
  @Get()
  @ResponseMessage('Exams')
  @ApiOperation({ summary: 'Faol imtihonlar ro`yxati (ochiq)' })
  @ApiDataResponse(ExamDto, { isArray: true })
  findActive(@Query() query: ExamQueryDto) {
    return this.examsService.findActive(query);
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('all')
  @ResponseMessage('Exams')
  @ApiOperation({ summary: 'Barcha imtihonlar — nofaollari bilan (admin)' })
  @ApiDataResponse(AdminExamDto, { isArray: true })
  @ApiErrorResponses(401, 403)
  findAll(@Query() query: ExamQueryDto) {
    return this.examsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Exam')
  @ApiOperation({ summary: 'Bitta faol imtihon' })
  @ApiDataResponse(ExamDto)
  @ApiErrorResponses(404)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.findOneActive(id);
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ResponseMessage('Exam created')
  @ApiOperation({ summary: 'Yangi imtihon sozlamasi' })
  @ApiDataResponse(ExamDto, { status: 201 })
  @ApiErrorResponses(400, 401, 403, 404)
  create(@Body() dto: CreateExamDto) {
    return this.examsService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ResponseMessage('Exam updated')
  @ApiOperation({ summary: 'Imtihon sozlamasini tahrirlash' })
  @ApiDataResponse(ExamDto)
  @ApiErrorResponses(400, 401, 403, 404)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExamDto) {
    return this.examsService.update(id, dto);
  }
}
