import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLopNamDto {
    @IsInt()
    @IsNotEmpty()
    lopId: number;

    @IsInt()
    @IsNotEmpty()
    namHocId: number;

    @IsInt()
    @IsOptional()
    gvChuNhiemId?: number;
}
