import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrangThaiBanBe } from '@prisma/client';
import { ChatService } from '../../communication/services/chat.service';
import { WebsocketGateway } from '../../communication/websocket.gateway';

@Injectable()
export class FriendsService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => ChatService))
        private chatService: ChatService,
        private websocketGateway: WebsocketGateway
    ) { }

    async sendRequest(senderId: number, receiverId: number) {
        if (senderId === receiverId) {
            throw new BadRequestException('Không thể kết bạn với chính mình');
        }

        // Kiểm tra xem đã có yêu cầu nào chưa
        const existing = await this.prisma.ketBan.findFirst({
            where: {
                OR: [
                    { nguoiGuiId: senderId, nguoiNhanId: receiverId },
                    { nguoiGuiId: receiverId, nguoiNhanId: senderId }
                ]
            }
        });

        if (existing) {
            if (existing.trangThai === TrangThaiBanBe.DA_KET_BAN) {
                throw new BadRequestException('Hai người đã là bạn bè');
            }
            if (existing.trangThai === TrangThaiBanBe.BI_CHAN) {
                throw new BadRequestException('Không thể thực hiện yêu cầu này');
            }
            if (existing.nguoiGuiId === senderId) {
                throw new BadRequestException('Bạn đã gửi lời mời kết bạn rồi');
            } else {
                throw new BadRequestException('Người này đã gửi lời mời kết bạn cho bạn');
            }
        }

        const request = await this.prisma.ketBan.create({
            data: {
                nguoiGuiId: senderId,
                nguoiNhanId: receiverId,
                trangThai: TrangThaiBanBe.CHO_XAC_NHAN
            }
        });

        // Emit socket event to receiver
        this.websocketGateway.emitToUser(receiverId, 'friend:request', {
            type: 'new',
            senderId,
            requestId: request.id
        });

        // Tự động follow khi gửi lời mời kết bạn (Kết bạn thì sẽ flow)
        await this.prisma.flowTheoDoi.upsert({
            where: {
                nguoiTheoDoiId_nguoiDuocTheoDoiId: {
                    nguoiTheoDoiId: senderId,
                    nguoiDuocTheoDoiId: receiverId
                }
            },
            update: {},
            create: {
                nguoiTheoDoiId: senderId,
                nguoiDuocTheoDoiId: receiverId
            }
        });

        return request;
    }

    async acceptRequest(userId: number, requesterId: number) {
        const request = await this.prisma.ketBan.findUnique({
            where: {
                nguoiGuiId_nguoiNhanId: {
                    nguoiGuiId: requesterId,
                    nguoiNhanId: userId
                }
            }
        });

        if (!request || request.trangThai !== TrangThaiBanBe.CHO_XAC_NHAN) {
            throw new NotFoundException('Không tìm thấy lời mời kết bạn phù hợp');
        }

        // Update friendship status
        const friendship = await this.prisma.ketBan.update({
            where: { id: request.id },
            data: { trangThai: TrangThaiBanBe.DA_KET_BAN }
        });

        // Create chat channel for the new friends
        await this.chatService.createDirectMessageChannel(requesterId, userId);

        // Emit socket event to both users
        this.websocketGateway.emitToUser(requesterId, 'friend:request', {
            type: 'accepted',
            userId,
            friendshipId: friendship.id
        });
        this.websocketGateway.emitToUser(userId, 'friend:request', {
            type: 'accepted',
            userId: requesterId,
            friendshipId: friendship.id
        });

        // Tự động follow lại khi đồng ý kết bạn (Kết bạn thì sẽ flow - mutual follow)
        await this.prisma.flowTheoDoi.upsert({
            where: {
                nguoiTheoDoiId_nguoiDuocTheoDoiId: {
                    nguoiTheoDoiId: userId,
                    nguoiDuocTheoDoiId: requesterId
                }
            },
            update: {},
            create: {
                nguoiTheoDoiId: userId,
                nguoiDuocTheoDoiId: requesterId
            }
        });

        return friendship;
    }

    async declineRequest(userId: number, requesterId: number) {
        const request = await this.prisma.ketBan.findUnique({
            where: {
                nguoiGuiId_nguoiNhanId: {
                    nguoiGuiId: requesterId,
                    nguoiNhanId: userId
                }
            }
        });

        if (!request || request.trangThai !== TrangThaiBanBe.CHO_XAC_NHAN) {
            throw new NotFoundException('Không tìm thấy lời mời kết bạn');
        }

        const deleted = await this.prisma.ketBan.delete({
            where: { id: request.id }
        });

        // Emit socket event to requester
        this.websocketGateway.emitToUser(requesterId, 'friend:request', {
            type: 'declined',
            userId
        });

        return deleted;
    }

    async cancelRequest(userId: number, receiverId: number) {
        const request = await this.prisma.ketBan.findUnique({
            where: {
                nguoiGuiId_nguoiNhanId: {
                    nguoiGuiId: userId,
                    nguoiNhanId: receiverId
                }
            }
        });

        if (!request || request.trangThai !== TrangThaiBanBe.CHO_XAC_NHAN) {
            throw new NotFoundException('Không tìm thấy lời mời đã gửi');
        }

        return this.prisma.ketBan.delete({
            where: { id: request.id }
        });
    }

    async unfriend(userId: number, friendId: number) {
        const friendship = await this.prisma.ketBan.findFirst({
            where: {
                OR: [
                    { nguoiGuiId: userId, nguoiNhanId: friendId, trangThai: TrangThaiBanBe.DA_KET_BAN },
                    { nguoiGuiId: friendId, nguoiNhanId: userId, trangThai: TrangThaiBanBe.DA_KET_BAN }
                ]
            }
        });

        if (!friendship) {
            throw new NotFoundException('Hai người chưa là bạn bè');
        }

        return this.prisma.ketBan.delete({
            where: { id: friendship.id }
        });
    }

    async getFriends(userId: number) {
        const friendships = await this.prisma.ketBan.findMany({
            where: {
                OR: [
                    { nguoiGuiId: userId, trangThai: TrangThaiBanBe.DA_KET_BAN },
                    { nguoiNhanId: userId, trangThai: TrangThaiBanBe.DA_KET_BAN }
                ]
            },
            include: {
                nguoiGui: {
                    select: { id: true, taiKhoan: true, avatar: true, hoTen: true }
                },
                nguoiNhan: {
                    select: { id: true, taiKhoan: true, avatar: true, hoTen: true }
                }
            }
        });

        return friendships.map((f: any) => f.nguoiGuiId === userId ? f.nguoiNhan : f.nguoiGui);
    }

    async getPendingRequests(userId: number) {
        return this.prisma.ketBan.findMany({
            where: {
                nguoiNhanId: userId,
                trangThai: TrangThaiBanBe.CHO_XAC_NHAN
            },
            include: {
                nguoiGui: {
                    select: { id: true, taiKhoan: true, avatar: true, hoTen: true }
                }
            },
            orderBy: { ngayTao: 'desc' }
        });
    }

    async getSentRequests(userId: number) {
        return this.prisma.ketBan.findMany({
            where: {
                nguoiGuiId: userId,
                trangThai: TrangThaiBanBe.CHO_XAC_NHAN
            },
            include: {
                nguoiNhan: {
                    select: { id: true, taiKhoan: true, avatar: true, hoTen: true }
                }
            },
            orderBy: { ngayTao: 'desc' }
        });
    }

    async checkStatus(userId: number, targetId: number) {
        const friendship = await this.prisma.ketBan.findFirst({
            where: {
                OR: [
                    { nguoiGuiId: userId, nguoiNhanId: targetId },
                    { nguoiGuiId: targetId, nguoiNhanId: userId }
                ]
            }
        });

        if (!friendship) return { status: 'NONE' };
        if (friendship.trangThai === TrangThaiBanBe.DA_KET_BAN) return { status: 'FRIEND' };
        if (friendship.trangThai === TrangThaiBanBe.BI_CHAN) return { status: 'BLOCKED' };

        if (friendship.nguoiGuiId === userId) return { status: 'SENT' };
        return { status: 'RECEIVED' };
    }

    async searchUsers(userId: number, q: string) {
        return this.prisma.nguoiDung.findMany({
            where: {
                id: { not: userId },
                OR: [
                    { hoTen: { contains: q, } },
                    { taiKhoan: { contains: q } },
                    { email: { contains: q } }
                ]
            },
            select: {
                id: true,
                taiKhoan: true,
                hoTen: true,
                avatar: true,
                vaiTro: true
            },
            take: 20
        });
    }
}
