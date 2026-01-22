import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCalendarDto {
    @IsInt()
    @Type(() => Number)
    lopNamId: number;

    @IsInt()
    @Type(() => Number)
    monHocId: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    gvDayId?: number;

    @IsInt()
    @Min(2)
    @Max(8)
    @Type(() => Number)
    thu: number; // 2-7 (Mon-Sat), 8 (Sunday)

    @IsInt()
    @Min(1)
    @Max(10)
    @Type(() => Number)
    tietBatDau: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    soTiet?: number;

    @IsOptional()
    @IsString()
    phongHoc?: string;

    @IsOptional()
    @IsString()
    ngay?: string;
}

export class UpdateCalendarDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    monHocId?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    gvDayId?: number;

    @IsOptional()
    @IsInt()
    @Min(2)
    @Max(8)
    @Type(() => Number)
    thu?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    @Type(() => Number)
    tietBatDau?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    soTiet?: number;

    @IsOptional()
    @IsString()
    phongHoc?: string;
}
