import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateScheduleDto {
  @ApiProperty({
    example: ['uuid-subject-1', 'uuid-subject-2'],
    description: 'List of subject IDs to optimize',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  subjectIds: string[];
}
