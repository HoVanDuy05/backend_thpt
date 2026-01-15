import { IsEmail, IsEnum, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { VaiTro, GioiTinh, TrinhDo, TrangThaiHocTap } from '@prisma/client';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    matKhau?: string;

    @IsOptional()
    @IsEnum(VaiTro)
    vaiTro?: VaiTro;

    @IsOptional()
    @IsString()
    hoTen?: string;

    // Profile common
    @IsOptional()
    @IsDateString()
    ngaySinh?: string;

    @IsOptional()
    @IsEnum(GioiTinh)
    gioiTinh?: GioiTinh;

    @IsOptional()
    @IsString()
    soDienThoai?: string;

    @IsOptional()
    @IsString()
    cccd?: string;

    // Student specific
    @IsOptional()
    @IsString()
    maSoHs?: string;

    @IsOptional()
    @IsNumber()
    lopId?: number;

    @IsOptional()
    @IsEnum(TrangThaiHocTap)
    trangThai?: TrangThaiHocTap;

    // Teacher specific
    @IsOptional()
    @IsString()
    maSoGv?: string;

    @IsOptional()
    @IsEnum(TrinhDo)
    trinhDo?: TrinhDo;

    @IsOptional()
    @IsString()
    chuyenMon?: string;

    // Staff specific
    @IsOptional()
    @IsString()
    maSo?: string;

    // Catch-all for other profile fields
    [key: string]: any;
}
