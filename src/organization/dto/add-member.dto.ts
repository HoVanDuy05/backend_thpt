import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { VaiTroToChuc } from '@prisma/client';

export class AddMemberDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(VaiTroToChuc)
  @IsOptional()
  vaiTroTrongToChuc?: VaiTroToChuc;
}
