import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { LoaiBaiViet } from '@prisma/client';

export class CreatePostDto {
    @ApiProperty({ description: 'Tiêu đề bài viết' })
    @IsNotEmpty()
    @IsString()
    tieuDe: string;

    @ApiProperty({ description: 'Đường dẫn tĩnh (Slug)' })
    @IsNotEmpty()
    @IsString()
    duongDan: string;

    @ApiProperty({ description: 'Tóm tắt bài viết (Optional)' })
    @IsOptional()
    @IsString()
    tomTat?: string;

    @ApiProperty({ description: 'Nội dung bài viết (HTML)' })
    @IsNotEmpty()
    @IsString()
    noiDung: string;

    @ApiProperty({ description: 'Ảnh bìa (URL)' })
    @IsOptional()
    @IsUrl()
    anhBia?: string;

    @ApiProperty({ description: 'Loại bài viết', enum: LoaiBaiViet, default: LoaiBaiViet.TIN_TUC })
    @IsOptional()
    @IsEnum(LoaiBaiViet)
    loai?: LoaiBaiViet;

    @ApiProperty({ description: 'Trạng thái xuất bản', default: false })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    daXuatBan?: boolean;
}

export class UpdatePostDto extends CreatePostDto { }
