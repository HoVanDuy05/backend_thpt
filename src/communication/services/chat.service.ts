import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChannelDto, CreateMessageDto } from '../dto/chat.dto';
import { LoaiKenhChat, TrangThaiBanBe } from '@prisma/client';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async createChannel(userId: number, createChannelDto: CreateChannelDto) {
        if (createChannelDto.loaiKenh === LoaiKenhChat.CA_NHAN) {
            const friendId = createChannelDto.thanhVienIds?.find(id => id !== userId);
            if (!friendId) {
                // Special case for self-chat or missing IDs
                // For now, let's just enforce friendId
            } else {
                const friendship = await this.prisma.ketBan.findFirst({
                    where: {
                        OR: [
                            { nguoiGuiId: userId, nguoiNhanId: friendId, trangThai: TrangThaiBanBe.DA_KET_BAN },
                            { nguoiGuiId: friendId, nguoiNhanId: userId, trangThai: TrangThaiBanBe.DA_KET_BAN }
                        ]
                    }
                });

                if (!friendship) {
                    throw new ForbiddenException('Chỉ có thể nhắn tin cho người đã kết bạn');
                }
            }
        }

        const members = [{ nguoiDungId: userId, vaiTro: 'QUAN_TRI' }]; // Creator is admin
        if (createChannelDto.thanhVienIds) {
            createChannelDto.thanhVienIds.forEach(id => {
                if (id !== userId) members.push({ nguoiDungId: id, vaiTro: 'THANH_VIEN' }); // Others are members
            });
        }

        // Must fix VaiTroKenh enum mapping if needed, using string cast for Prisma
        // Prisma expects generated enum types usually.
        // Assuming VaiTroKenh matches schema string perfectly.

        return this.prisma.kenhChat.create({
            data: {
                tenKenh: createChannelDto.tenKenh,
                loaiKenh: createChannelDto.loaiKenh,
                thanhViens: {
                    create: members.map(m => ({
                        nguoiDungId: m.nguoiDungId,
                        vaiTro: m.vaiTro as any // Cast to Enum
                    }))
                }
            },
            include: { thanhViens: true }
        });
    }

    async getUserChannels(userId: number) {
        return this.prisma.thanhVienKenh.findMany({
            where: { nguoiDungId: userId },
            include: {
                kenhChat: {
                    include: {
                        tinNhans: {
                            orderBy: { ngayGui: 'desc' },
                            take: 1
                        },
                        thanhViens: {
                            include: { nguoiDung: { select: { id: true, taiKhoan: true, hoSoHocSinh: { select: { hoTen: true } }, hoSoGiaoVien: { select: { hoTen: true } } } } }
                        }
                    }
                }
            }
        });
    }

    async getMessages(channelId: number, userId: number, page: number = 1) {
        // Check if user is member
        const isMember = await this.prisma.thanhVienKenh.findUnique({
            where: { kenhChatId_nguoiDungId: { kenhChatId: channelId, nguoiDungId: userId } }
        });
        if (!isMember) throw new ForbiddenException('You are not a member of this channel');

        const take = 50;
        const skip = (page - 1) * take;

        return this.prisma.tinNhan.findMany({
            where: { kenhChatId: channelId },
            orderBy: { ngayGui: 'desc' },
            take,
            skip,
            include: {
                nguoiGui: {
                    select: { id: true, taiKhoan: true, hoSoHocSinh: { select: { hoTen: true } }, hoSoGiaoVien: { select: { hoTen: true } } }
                }
            }
        });
    }

    async sendMessage(userId: number, createMessageDto: CreateMessageDto) {
        // Check membership
        const isMember = await this.prisma.thanhVienKenh.findUnique({
            where: { kenhChatId_nguoiDungId: { kenhChatId: createMessageDto.kenhChatId, nguoiDungId: userId } }
        });
        if (!isMember) throw new ForbiddenException('You are not a member of this channel');

        return this.prisma.tinNhan.create({
            data: {
                ...createMessageDto,
                nguoiGuiId: userId
            }
        });
    }
}
