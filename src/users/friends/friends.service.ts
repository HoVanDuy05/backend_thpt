import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrangThaiBanBe } from '@prisma/client';

@Injectable()
export class FriendsService {
    constructor(private prisma: PrismaService) { }

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

        return this.prisma.ketBan.create({
            data: {
                nguoiGuiId: senderId,
                nguoiNhanId: receiverId,
                trangThai: TrangThaiBanBe.CHO_XAC_NHAN
            }
        });
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

        return this.prisma.ketBan.update({
            where: { id: request.id },
            data: { trangThai: TrangThaiBanBe.DA_KET_BAN }
        });
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

        return this.prisma.ketBan.delete({
            where: { id: request.id }
        });
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
                    select: { id: true, taiKhoan: true, hoSoHocSinh: { select: { hoTen: true } }, hoSoGiaoVien: { select: { hoTen: true } } }
                },
                nguoiNhan: {
                    select: { id: true, taiKhoan: true, hoSoHocSinh: { select: { hoTen: true } }, hoSoGiaoVien: { select: { hoTen: true } } }
                }
            }
        });

        return friendships.map(f => f.nguoiGuiId === userId ? f.nguoiNhan : f.nguoiGui);
    }

    async getPendingRequests(userId: number) {
        return this.prisma.ketBan.findMany({
            where: {
                nguoiNhanId: userId,
                trangThai: TrangThaiBanBe.CHO_XAC_NHAN
            },
            include: {
                nguoiGui: {
                    select: { id: true, taiKhoan: true, hoSoHocSinh: { select: { hoTen: true } }, hoSoGiaoVien: { select: { hoTen: true } } }
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
}
