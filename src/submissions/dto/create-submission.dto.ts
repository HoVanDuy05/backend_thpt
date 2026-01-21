import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsInt()
  @IsNotEmpty()
  deThiId: number;

  @IsInt()
  @IsNotEmpty()
  hocSinhId: number;

  @IsString()
  @IsOptional()
  noiDungBaiLam?: string;

  @IsString()
  @IsOptional()
  linkAnhChupBai?: string;
}
