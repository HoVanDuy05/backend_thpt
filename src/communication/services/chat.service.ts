import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChannelDto, CreateMessageDto } from '../dto/chat.dto';
import { LoaiKenhChat, TrangThaiBanBe } from '@prisma/client';
import { WebsocketGateway } from '../websocket.gateway';
import { NotificationService } from './notification.service';

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => WebsocketGateway))
        private websocketGateway: WebsocketGateway,
        @Inject(forwardRef(() => NotificationService))
        private notificationService: NotificationService
    ) { }

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

                // Check existing 1-1 channel
                const existingChannel = await this.prisma.kenhChat.findFirst({
                    where: {
                        loaiKenh: LoaiKenhChat.CA_NHAN,
                        AND: [
                            { thanhViens: { some: { nguoiDungId: userId } } },
                            { thanhViens: { some: { nguoiDungId: friendId } } }
                        ]
                    },
                    include: { thanhViens: true }
                });
                if (existingChannel) return existingChannel;
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

    async createDirectMessageChannel(userId1: number, userId2: number) {
        // Check if channel already exists
        const existingChannel = await this.prisma.kenhChat.findFirst({
            where: {
                loaiKenh: LoaiKenhChat.CA_NHAN,
                AND: [
                    { thanhViens: { some: { nguoiDungId: userId1 } } },
                    { thanhViens: { some: { nguoiDungId: userId2 } } }
                ]
            },
            include: { thanhViens: true }
        });

        if (existingChannel) {
            return existingChannel;
        }

        // Create new direct message channel
        return this.prisma.kenhChat.create({
            data: {
                loaiKenh: LoaiKenhChat.CA_NHAN,
                thanhViens: {
                    create: [
                        {
                            nguoiDungId: userId1,
                            vaiTro: 'QUAN_TRI' as any
                        },
                        {
                            nguoiDungId: userId2,
                            vaiTro: 'THANH_VIEN' as any
                        }
                    ]
                }
            },
            include: {
                thanhViens: {
                    include: {
                        nguoiDung: {
                            select: {
                                id: true,
                                taiKhoan: true,
                                hoTen: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
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
                            include: {
                                nguoiDung: {
                                    select: {
                                        id: true,
                                        taiKhoan: true,
                                        hoTen: true,
                                        avatar: true,
                                        hoSoHocSinh: { select: { hoTen: true } },
                                        hoSoGiaoVien: { select: { hoTen: true } }
                                    }
                                }
                            }
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

    async sendMessage(userId: number, createMessageDto: CreateMessageDto, locale: string = 'vi') {
        // Check membership
        const isMember = await this.prisma.thanhVienKenh.findUnique({
            where: { kenhChatId_nguoiDungId: { kenhChatId: createMessageDto.kenhChatId, nguoiDungId: userId } }
        });
        if (!isMember) throw new ForbiddenException('You are not a member of this channel');

        const { tinNhanGocId, ...messageData } = createMessageDto;

        // Create message
        const message = await this.prisma.tinNhan.create({
            data: {
                ...messageData,
                nguoiGuiId: userId,
                ...(tinNhanGocId ? {
                    tinNhanGoc: {
                        connect: { id: tinNhanGocId }
                    }
                } : {})
            },
            include: {
                nguoiGui: {
                    select: { id: true, taiKhoan: true, hoSoHocSinh: { select: { hoTen: true } }, hoSoGiaoVien: { select: { hoTen: true } } }
                },
                kenhChat: {
                    select: {
                        id: true,
                        loaiKenh: true,
                        thanhViens: {
                            select: { nguoiDungId: true }
                        }
                    }
                }
            }
        });

        // 1. Emit to channel (for active chat windows)
        this.websocketGateway.emitNewMessage(createMessageDto.kenhChatId, message);

        // 2. Emit to each member (for sidebar updates & multi-device sync)
        try {
            const members = (message as any)?.kenhChat?.thanhViens || [];
            for (const m of members) {
                const memberId = m?.nguoiDungId;
                if (!memberId) continue;
                this.websocketGateway.emitToUser(memberId, 'message:new', message);
            }
        } catch (error) {
            console.error('Socket emit error:', error);
        }

        // Create notifications for other members
        const otherMembers = message.kenhChat.thanhViens
            .filter(member => member.nguoiDungId !== userId)
            .map(member => member.nguoiDungId);

        for (const memberId of otherMembers) {
            const senderName = message.nguoiGui.hoSoHocSinh?.hoTen ||
                message.nguoiGui.hoSoGiaoVien?.hoTen ||
                message.nguoiGui.taiKhoan;

            const isGroup = message.kenhChat.loaiKenh === LoaiKenhChat.NHOM;
            const channelName = isGroup ? (message.kenhChat as any).tenKenh : '';

            const notificationContent: string = message.loai === 'VAN_BAN'
                ? (message.noiDung || '')
                : message.loai === 'HINH_ANH' ? '📷 Ảnh' :
                    message.loai === 'GHI_AM' ? '🎤 Tin nhắn thoại' : '📎 Tệp đính kèm';

            // Create notification record
            await this.notificationService.create({
                tieuDe: isGroup ? `${senderName} trong ${channelName}` : senderName,
                noiDung: notificationContent,
                nguoiNhanId: memberId,
                lienKet: `/${locale}/chat?id=${message.kenhChatId}`,
                loai: 'TIN_NHAN' as any
            });

            // Send real-time notification (already handled by websocketGateway emitting to user in step 2 above)
            // But we can add a specific notification event if needed for non-chat pages
            this.websocketGateway.emitToUser(memberId, 'notification:new', {
                type: 'message',
                message: message,
                channel: message.kenhChat
            });
        }

        return message;
    }
}
