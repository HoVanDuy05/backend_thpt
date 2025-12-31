import { IsInt, IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateStudentAccountDto {
    // User Account Fields
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    matKhau: string;

    // Student Profile Fields
    @IsString()
    @IsNotEmpty()
    maSoHs: string;

    @IsString()
    @IsNotEmpty()
    hoTen: string;

    @IsString()
    @IsOptional()
    ngaySinh?: string; // ISO Date string

    @IsInt()
    @IsNotEmpty()
    lopId: number;

    @IsString()
    @IsOptional()
    gioiTinh?: string;
}
