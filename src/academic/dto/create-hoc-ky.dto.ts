import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHocKyDto {
    @IsString()
    @IsNotEmpty()
    tenHocKy: string;

    @IsNumber()
    @IsNotEmpty()
    namHocId: number;

    @IsDateString()
    @IsOptional()
    ngayBatDau?: string;

    @IsDateString()
    @IsOptional()
    ngayKetThuc?: string;

    @IsBoolean()
    @IsOptional()
    dangKichHoat?: boolean;
}
