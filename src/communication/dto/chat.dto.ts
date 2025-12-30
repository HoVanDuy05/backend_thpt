import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoaiKenhChat, LoaiTinNhan } from '@prisma/client';

export class CreateChannelDto {
    @ApiProperty({ description: 'Tên kênh (Bắt buộc cho NHOM)' })
    @IsOptional()
    @IsString()
    tenKenh?: string;

    @ApiProperty({ description: 'Loại kênh (CA_NHAN hoặc NHOM)', enum: LoaiKenhChat })
    @IsNotEmpty()
    @IsEnum(LoaiKenhChat)
    loaiKenh: LoaiKenhChat;

    @ApiProperty({ description: 'Danh sách ID thành viên (Ngoài người tạo)', type: [Number] })
    @IsOptional()
    @IsArray()
    thanhVienIds: number[];
}

export class CreateMessageDto {
    @ApiProperty({ description: 'ID kênh chat' })
    @IsNotEmpty()
    @IsNumber()
    kenhChatId: number;

    @ApiProperty({ description: 'Nội dung tin nhắn' })
    @IsOptional()
    @IsString()
    noiDung?: string;

    @ApiProperty({ description: 'Loại tin nhắn', enum: LoaiTinNhan, default: LoaiTinNhan.VAN_BAN })
    @IsOptional()
    @IsEnum(LoaiTinNhan)
    loai?: LoaiTinNhan;

    @ApiProperty({ description: 'Đường dẫn tệp (Nếu có)' })
    @IsOptional()
    @IsString()
    duongDanTep?: string;
}
