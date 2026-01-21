import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNamHocDto {
  @IsString()
  @IsNotEmpty()
  tenNamHoc: string;

  @IsDateString()
  @IsOptional()
  ngayBatDau?: string;

  @IsDateString()
  @IsOptional()
  ngayKetThuc?: string;

  @IsBoolean()
  @IsOptional()
  dangKichHoat?: boolean;
}
