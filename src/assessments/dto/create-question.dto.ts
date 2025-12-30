import { LoaiCauHoi } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
    @IsInt()
    @IsNotEmpty()
    monHocId: number;

    @IsInt()
    @IsOptional()
    gvTaoId?: number;

    @IsString()
    @IsNotEmpty()
    noiDungCauHoi: string;

    @IsEnum(LoaiCauHoi)
    @IsNotEmpty()
    loaiCauHoi: LoaiCauHoi;

    @IsString()
    @IsOptional()
    dapAnDung?: string;

    @IsString()
    @IsOptional()
    loiGiaiChiTiet?: string;
}
