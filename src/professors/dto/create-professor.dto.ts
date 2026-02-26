import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProfessorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;
}
