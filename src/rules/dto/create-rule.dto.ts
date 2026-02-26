import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { RuleParameter } from 'src/types/rule-parameter.types';

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @IsInt()
  @Min(1)
  priorityOrder: number;

  @IsOptional()
  parameters?: RuleParameter;
}
