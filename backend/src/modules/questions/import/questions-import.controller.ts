import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
} from 'src/common/swagger/api-response.decorator';
import { Difficulty, UserRole } from 'src/generated/prisma/enums';

import {
  ImportQuestionsDto,
  ImportResultDto,
} from '../dto/import-questions.dto';
import { QuestionsImportService } from './questions-import.service';

const MAX_IMPORT_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('Admin · Questions')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/exams/:examId/questions')
export class QuestionsImportController {
  constructor(private readonly importService: QuestionsImportService) {}

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMPORT_SIZE_BYTES, files: 1 },
    }),
  )
  @ResponseMessage('Import finished')
  @ApiOperation({
    summary: 'Savollarni CSV yoki Excel fayldan import qilish',
    description:
      'Ustunlar: `Savol | A | B | C | D | E | F | To`g`ri javob | Daraja`. ' +
      'Ustunlar tartibi muhim emas; `C`–`F` va `Daraja` ixtiyoriy.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        skipInvalidRows: { type: 'boolean', default: false },
        defaultDifficulty: {
          type: 'string',
          enum: Object.values(Difficulty),
          default: Difficulty.INTERMEDIATE,
        },
      },
    },
  })
  @ApiDataResponse(ImportResultDto, { status: 201 })
  @ApiErrorResponses(400, 401, 403, 404)
  import(
    @Param('examId', ParseIntPipe) examId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportQuestionsDto,
  ) {
    return this.importService.import(examId, file, dto);
  }
}
