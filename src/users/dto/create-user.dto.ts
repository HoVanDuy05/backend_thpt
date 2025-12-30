import { VaiTro } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    taiKhoan: string;

    @IsString()
    @IsNotEmpty()
    matKhau: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsEnum(VaiTro)
    vaiTro: VaiTro;
}
