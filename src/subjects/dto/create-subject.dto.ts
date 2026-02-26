import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Matemáticas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
