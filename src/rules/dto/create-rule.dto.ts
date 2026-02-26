import { IsString, IsNotEmpty, IsInt, Min, MaxLength } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @IsInt()
  @Min(1)
  priorityOrder: number;
}
