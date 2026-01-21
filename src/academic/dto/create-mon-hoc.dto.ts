import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMonHocDto {
  @IsString()
  @IsNotEmpty()
  tenMon: string;

  @IsString()
  @IsOptional()
  maMon?: string;

  @IsString()
  @IsOptional()
  moTa?: string;

  @IsInt()
  @IsOptional()
  khoiId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
