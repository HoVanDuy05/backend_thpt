import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExamDto {
  @IsInt()
  @IsNotEmpty()
  monHocId: number;

  @IsInt()
  @IsOptional()
  gvTaoId?: number;

  @IsString()
  @IsNotEmpty()
  tieuDe: string;

  @IsString()
  @IsOptional()
  loaiBaiThi?: string;

  @IsInt()
  @IsOptional()
  thoiGianLamBai?: number;

  @IsString() // Should be Date string ISO
  @IsOptional()
  hanNopBai?: string;
}
