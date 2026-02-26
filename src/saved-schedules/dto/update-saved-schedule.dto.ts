import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateSavedScheduleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
