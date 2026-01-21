import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateKhoiDto {
  @IsString()
  @IsNotEmpty()
  tenKhoi: string;

  @IsInt()
  @IsNotEmpty()
  maKhoi: number;

  @IsString()
  @IsOptional()
  moTa?: string;
}
