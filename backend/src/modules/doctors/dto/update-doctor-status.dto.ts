import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateDoctorStatusDto {
  @ApiProperty({ example: false, description: '`false` — hisob bloklanadi' })
  @IsBoolean()
  isActive: boolean;
}
