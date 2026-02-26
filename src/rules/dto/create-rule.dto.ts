import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RuleParameter } from 'src/types/rule-parameter.types';

export class CreateRuleDto {
  @ApiProperty({
    example: 'NO_GAPS',
    description: 'Rule type from the catalog',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiProperty({ example: 1, description: 'Priority order (1 = highest)' })
  @IsInt()
  @Min(1)
  priorityOrder: number;

  @ApiPropertyOptional({
    example: { type: 'timeRange', value: { start: '12:00', end: '14:00' } },
    description: 'Optional parameters depending on rule type',
  })
  @IsOptional()
  parameters?: RuleParameter;
}
