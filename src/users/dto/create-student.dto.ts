import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

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
    @IsOptional()
    lopId?: number;
}
