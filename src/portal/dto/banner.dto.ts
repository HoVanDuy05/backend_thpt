import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateBannerDto {
  @ApiProperty({ description: 'Tiêu đề banner (Optional)' })
  @IsOptional()
  @IsString()
  tieuDe?: string;

  @ApiProperty({ description: 'Mô tả ngắn (Optional)' })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiProperty({ description: 'URL hình ảnh' })
  @IsNotEmpty()
  @IsUrl()
  hinhAnh: string;

  @ApiProperty({ description: 'Đường dẫn liên kết khi click (Optional)' })
  @IsOptional()
  @IsString()
  lienKet?: string;

  @ApiProperty({ description: 'Thứ tự hiển thị', default: 0 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  thuTu?: number;

  @ApiProperty({ description: 'Trạng thái kích hoạt', default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  kichHoat?: boolean;
}

export class UpdateBannerDto extends CreateBannerDto {}
