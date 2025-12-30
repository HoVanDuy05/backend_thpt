import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({ description: 'ID bài viết' })
    @IsNotEmpty()
    @IsNumber()
    baiVietId: number;

    @ApiProperty({ description: 'Nội dung bình luận' })
    @IsNotEmpty()
    @IsString()
    noiDung: string;

    @ApiProperty({ description: 'ID bình luận cha (nếu là reply)', required: false })
    @IsOptional()
    @IsNumber()
    binhLuanChaId?: number;
}
