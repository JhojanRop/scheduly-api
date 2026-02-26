import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSavedScheduleDto {
  @ApiProperty({ example: 'Mi horario actualizado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
