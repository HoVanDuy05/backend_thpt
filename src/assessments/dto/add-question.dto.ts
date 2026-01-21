import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class AddQuestionToExamDto {
  @IsInt()
  @IsNotEmpty()
  cauHoiId: number;

  @IsInt()
  @IsOptional()
  thuTuCau?: number;
}
