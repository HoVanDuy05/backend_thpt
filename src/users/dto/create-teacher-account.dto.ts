import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateTeacherAccountDto {
    // User Account Fields
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    matKhau: string;

    // Teacher Profile Fields
    @IsString()
    @IsNotEmpty()
    maSoGv: string;

    @IsString()
    @IsNotEmpty()
    hoTen: string;

    @IsString()
    @IsOptional()
    chuyenMon?: string;

    @IsString()
    @IsOptional()
    ngaySinh?: string; // ISO Date string

    @IsString()
    @IsOptional()
    gioiTinh?: string;
}
