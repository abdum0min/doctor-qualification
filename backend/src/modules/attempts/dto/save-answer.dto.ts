import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, ValidateIf } from 'class-validator';

export class SaveAnswerDto {
  @ApiProperty({ example: 42, description: 'Urinishdagi savol identifikatori' })
  @IsInt()
  @IsPositive()
  attemptQuestionId: number;

  @ApiProperty({
    example: 168,
    nullable: true,
    description: 'Tanlangan variant. `null` — javobni bekor qilish.',
  })
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @IsPositive()
  attemptOptionId: number | null;
}
