import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoaiThongBao } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Tiêu đề thông báo' })
  @IsNotEmpty()
  @IsString()
  tieuDe: string;

  @ApiProperty({ description: 'Nội dung thông báo' })
  @IsNotEmpty()
  @IsString()
  noiDung: string;

  @ApiProperty({
    description:
      'ID người nhận (0 nếu gửi cho nhiều người - logic xử lý ở service)',
  })
  @IsNotEmpty()
  @IsNumber()
  nguoiNhanId: number;

  @ApiProperty({
    description: 'Loại thông báo',
    enum: LoaiThongBao,
    default: LoaiThongBao.HE_THONG,
  })
  @IsOptional()
  @IsEnum(LoaiThongBao)
  loai?: LoaiThongBao;

  @ApiProperty({ description: 'Liên kết (Optional)' })
  @IsOptional()
  @IsString()
  lienKet?: string;
}
