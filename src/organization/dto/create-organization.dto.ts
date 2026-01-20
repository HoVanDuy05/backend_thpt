import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { LoaiToChuc } from '@prisma/client';

export class CreateOrganizationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    ten: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    ma: string;

    @IsString()
    @IsOptional()
    moTa?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    hinhAnh?: string;

    @IsEnum(LoaiToChuc)
    @IsOptional()
    loaiToChuc?: LoaiToChuc;
}
