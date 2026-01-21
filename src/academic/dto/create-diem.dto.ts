import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CreateDiemDto {
  @IsInt()
  @IsNotEmpty()
  hocSinhId: number;

  @IsInt()
  @IsNotEmpty()
  monHocId: number;

  @IsInt()
  @IsNotEmpty()
  hocKyId: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  giuaKy?: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  cuoiKy?: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  trungBinh?: number;
}
