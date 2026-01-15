import { IsInt, IsNotEmpty, IsOptional, IsString, IsEmail, IsEnum, IsDateString } from 'class-validator';
import { GioiTinh, TrangThaiHocTap } from '@prisma/client';

export class CreateStudentAccountDto {
    // Account logic
    @IsOptional()
    isNewAccount?: boolean; // If true, create user. If false, search by email.

    // User Account Fields (Required for new account)
    @IsEmail({}, { message: 'validation.email.invalid' })
    @IsNotEmpty({ message: 'validation.email.required' })
    email: string;

    @IsString()
    @IsOptional()
    matKhau?: string; // Optional: system will generate if missing for new account

    // Student Profile Fields
    @IsString()
    @IsOptional()
    maSoHs?: string;

    @IsString()
    @IsNotEmpty({ message: 'Họ tên là bắt buộc' })
    hoTen: string;

    @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
    @IsOptional()
    ngaySinh?: string;

    @IsEnum(GioiTinh)
    @IsOptional()
    gioiTinh?: GioiTinh;

    @IsString()
    @IsOptional()
    noiSinh?: string;

    @IsString()
    @IsOptional()
    danToc?: string;

    @IsString()
    @IsOptional()
    tonGiao?: string;

    @IsString()
    @IsOptional()
    diaChiThuongTru?: string;

    @IsString()
    @IsOptional()
    diaChiTamTru?: string;

    @IsString()
    @IsOptional()
    soDienThoai?: string;

    @IsString()
    @IsOptional()
    cccd?: string;

    @IsDateString()
    @IsOptional()
    ngayCapCccd?: string;

    @IsString()
    @IsOptional()
    noiCapCccd?: string;

    // Parent Info
    @IsString()
    @IsOptional()
    hoTenCha?: string;

    @IsString()
    @IsOptional()
    ngheNghiepCha?: string;

    @IsString()
    @IsOptional()
    sdtCha?: string;

    @IsString()
    @IsOptional()
    hoTenMe?: string;

    @IsString()
    @IsOptional()
    ngheNghiepMe?: string;

    @IsString()
    @IsOptional()
    sdtMe?: string;

    // Academic Info
    @IsDateString()
    @IsOptional()
    ngayNhapHoc?: string;

    @IsEnum(TrangThaiHocTap)
    @IsOptional()
    trangThai?: TrangThaiHocTap;

    @IsInt()
    @IsOptional()
    lopId?: number;
}
