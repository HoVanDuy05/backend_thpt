import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMonHocDto {
    @IsString()
    @IsNotEmpty()
    tenMon: string;

    @IsString()
    @IsOptional()
    maMon?: string;

    @IsString()
    @IsOptional()
    moTa?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
