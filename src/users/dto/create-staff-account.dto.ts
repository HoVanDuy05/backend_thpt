import { IsNotEmpty, IsOptional, IsString, IsEmail, IsEnum, IsDateString } from 'class-validator';
import { GioiTinh } from '@prisma/client';

export class CreateStaffAccountDto {
    @IsOptional()
    isNewAccount?: boolean;

    @IsEmail({}, { message: 'validation.email.invalid' })
    @IsNotEmpty({ message: 'validation.email.required' })
    email: string;

    @IsString()
    @IsOptional()
    matKhau?: string;

    @IsString()
    @IsOptional()
    maSo?: string;

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
}
