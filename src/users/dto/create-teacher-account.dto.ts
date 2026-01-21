import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { GioiTinh, TrinhDo } from '@prisma/client';

export class CreateTeacherAccountDto {
  // Account logic
  @IsOptional()
  isNewAccount?: boolean;

  // User Account Fields
  @IsEmail({}, { message: 'validation.email.invalid' })
  @IsNotEmpty({ message: 'validation.email.required' })
  email: string;

  @IsString()
  @IsOptional()
  matKhau?: string;

  // Teacher Profile Fields
  @IsString()
  @IsOptional()
  maSoGv?: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên là bắt buộc' })
  hoTen: string;

  @IsDateString()
  @IsOptional()
  ngaySinh?: string;

  @IsEnum(GioiTinh)
  @IsOptional()
  gioiTinh?: GioiTinh;

  @IsString()
  @IsOptional()
  diaChi?: string;

  @IsString()
  @IsOptional()
  soDienThoai?: string;

  @IsEmail()
  @IsOptional()
  emailLienHe?: string;

  @IsString()
  @IsOptional()
  cccd?: string;

  @IsDateString()
  @IsOptional()
  ngayCapCccd?: string;

  @IsString()
  @IsOptional()
  noiCapCccd?: string;

  @IsEnum(TrinhDo)
  @IsOptional()
  trinhDo?: TrinhDo;

  @IsString()
  @IsOptional()
  chuyenMon?: string;

  @IsDateString()
  @IsOptional()
  ngayVaoLam?: string;
}
