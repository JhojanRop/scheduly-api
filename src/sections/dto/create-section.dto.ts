import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ example: '07:00', description: 'Start time in HH:MM format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string;

  @ApiProperty({ example: '09:00', description: 'End time in HH:MM format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string;

  @ApiProperty({ example: 'uuid-of-subject' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiPropertyOptional({ example: 'uuid-of-professor' })
  @IsUUID()
  @IsOptional()
  professorId?: string;

  @ApiProperty({
    example: [1, 3, 5],
    description: 'Day IDs (1=Monday, 7=Sunday)',
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  dayIds: number[];
}
