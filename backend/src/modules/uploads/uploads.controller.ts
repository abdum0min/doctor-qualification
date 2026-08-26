import {
  Controller,
  Delete,
  HttpCode,
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

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
} from 'src/common/swagger/api-response.decorator';

import { AvatarsService } from './avatars.service';
import { UploadedFileDto } from './dto/uploaded-file.dto';

/** Hajm cheklovi `MAX_UPLOAD_SIZE_MB` dan mustaqil xavfsizlik chegarasi. */
const MAX_REQUEST_BYTES = 20 * 1024 * 1024;

@ApiTags('Uploads')
@ApiBearerAuth('access-token')
@ApiErrorResponses(401)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_REQUEST_BYTES, files: 1 },
    }),
  )
  @ResponseMessage('Avatar uploaded')
  @ApiOperation({
    summary: 'Profil rasmini yuklash',
    description:
      'Faqat token egasining rasmi almashadi. Eski rasm diskdan o`chiriladi.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiDataResponse(UploadedFileDto, { status: 201 })
  @ApiErrorResponses(400, 404)
  upload(
    @CurrentUser('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.avatarsService.replace(userId, file);
  }

  @Delete('avatar')
  @HttpCode(200)
  @ResponseMessage('Avatar removed')
  @ApiOperation({ summary: 'Profil rasmini o`chirish' })
  @ApiErrorResponses(404)
  remove(@CurrentUser('id') userId: number) {
    return this.avatarsService.remove(userId);
  }
}
