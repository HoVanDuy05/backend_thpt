import { IsOptional, IsEnum } from 'class-validator';
import { VaiTro } from '@prisma/client';

export class FindUsersQueryDto {
    @IsOptional()
    @IsEnum(VaiTro)
    role?: VaiTro;
}
