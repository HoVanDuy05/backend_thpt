import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  maSoGv: string;

  @IsString()
  @IsNotEmpty()
  hoTen: string;

  @IsString()
  @IsOptional()
  chuyenMon?: string;
}
