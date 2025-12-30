import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLopHocDto {
    @IsInt()
    @IsOptional()
    namHocId?: number;

    @IsString()
    @IsNotEmpty()
    tenLop: string;

    @IsInt()
    @IsOptional()
    gvChuNhiemId?: number;
}
