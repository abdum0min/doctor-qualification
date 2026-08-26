import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileDto {
  @ApiProperty({ example: '/uploads/avatars/3f2b....jpg' })
  url: string;
}
