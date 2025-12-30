import { IsDecimal, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGradingDto {
    @IsInt()
    @IsNotEmpty()
    nopBaiId: number;

    @IsInt()
    @IsOptional()
    gvChamId?: number;

    @IsNotEmpty() // Can be string or number, handled in Service
    diemSo: number;

    @IsString()
    @IsOptional()
    nhanXetCuaGv?: string;
}
