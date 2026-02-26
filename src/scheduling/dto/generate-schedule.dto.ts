import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class GenerateScheduleDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  subjectIds: string[];
}
