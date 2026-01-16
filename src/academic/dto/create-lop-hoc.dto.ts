import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLopHocDto {
    @IsString()
    @IsNotEmpty()
    tenLop: string;

    @IsInt()
    @IsNotEmpty()
    khoiLop: number; // NEW: required (10, 11, 12)

    @IsString()
    @IsOptional()
    moTa?: string; // NEW: optional description

    // OLD fields - deprecated but kept for backward compatibility
    @IsInt()
    @IsOptional()
    namHocId?: number;

    @IsInt()
    @IsOptional()
    gvChuNhiemId?: number;
}
