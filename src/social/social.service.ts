import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
    constructor(private prisma: PrismaService) { }

    // --- THREADS ---

    async createThread(userId: number, data: { noiDung: string; hinhAnh?: string; threadChaId?: number }) {
        return this.prisma.thread.create({
            data: {
                tacGiaId: userId,
                noiDung: data.noiDung,
                hinhAnh: data.hinhAnh,
                threadChaId: data.threadChaId,
            },
        });
    }

    async getFeed(userId: number, limit = 20, cursor?: number) {
        // Lấy danh sách đang theo dõi
        const following = await this.prisma.flowTheoDoi.findMany({
            where: { nguoiTheoDoiId: userId },
            select: { nguoiDuocTheoDoiId: true },
        });

        const followingIds = following.map(f => f.nguoiDuocTheoDoiId);
        followingIds.push(userId); // Bao gồm cả bản thân

        return this.prisma.thread.findMany({
            where: {
                tacGiaId: { in: followingIds },
                threadChaId: null, // Chỉ lấy bài gốc
            },
            include: {
                tacGia: {
                    select: { id: true, taiKhoan: true, email: true },
                },
                _count: {
                    select: { likes: true, replies: true, reposts: true },
                },
            },
            orderBy: { ngayTao: 'desc' },
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });
    }

    async getThreadDetail(id: number) {
        return this.prisma.thread.findUnique({
            where: { id },
            include: {
                tacGia: {
                    select: { id: true, taiKhoan: true, email: true },
                },
                replies: {
                    include: {
                        tacGia: { select: { id: true, taiKhoan: true, email: true } },
                        _count: { select: { likes: true, replies: true } },
                    },
                    orderBy: { ngayTao: 'asc' },
                },
                _count: {
                    select: { likes: true, replies: true, reposts: true },
                },
            },
        });
    }

    // --- INTERACTIONS ---

    async toggleLike(userId: number, threadId: number) {
        const existing = await this.prisma.threadLike.findUnique({
            where: {
                threadId_nguoiDungId: { threadId, nguoiDungId: userId },
            },
        });

        if (existing) {
            await this.prisma.threadLike.delete({ where: { id: existing.id } });
            return { liked: false };
        } else {
            await this.prisma.threadLike.create({
                data: { threadId, nguoiDungId: userId },
            });
            return { liked: true };
        }
    }

    // --- NETWORK ---

    async toggleFollow(followerId: number, followingId: number) {
        if (followerId === followingId) throw new Error('Không thể theo dõi chính mình');

        const existing = await this.prisma.flowTheoDoi.findUnique({
            where: {
                nguoiTheoDoiId_nguoiDuocTheoDoiId: {
                    nguoiTheoDoiId: followerId,
                    nguoiDuocTheoDoiId: followingId,
                },
            },
        });

        if (existing) {
            await this.prisma.flowTheoDoi.delete({ where: { id: existing.id } });
            return { following: false };
        } else {
            await this.prisma.flowTheoDoi.create({
                data: {
                    nguoiTheoDoiId: followerId,
                    nguoiDuocTheoDoiId: followingId,
                },
            });
            return { following: true };
        }
    }
    async getUserThreads(userId: number, limit = 20, cursor?: number) {
        return this.prisma.thread.findMany({
            where: {
                tacGiaId: userId,
                threadChaId: null,
            },
            include: {
                tacGia: {
                    select: { id: true, taiKhoan: true, email: true },
                },
                _count: {
                    select: { likes: true, replies: true, reposts: true },
                },
            },
            orderBy: { ngayTao: 'desc' },
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });
    }

    async searchThreads(query: string, limit = 20) {
        return this.prisma.thread.findMany({
            where: {
                noiDung: { contains: query },
                threadChaId: null,
            },
            include: {
                tacGia: {
                    select: { id: true, taiKhoan: true, email: true },
                },
                _count: {
                    select: { likes: true, replies: true, reposts: true },
                },
            },
            take: limit,
            orderBy: { ngayTao: 'desc' },
        });
    }

    async getActivity(userId: number, limit = 20) {
        // Enforce a simple activity feed by combining recent interactions

        // 1. New followers
        const follows = await this.prisma.flowTheoDoi.findMany({
            where: { nguoiDuocTheoDoiId: userId },
            include: { nguoiTheoDoi: { select: { id: true, taiKhoan: true, email: true } } },
            orderBy: { ngayTao: 'desc' },
            take: limit,
        });

        // 2. Likes on my threads
        const likes = await this.prisma.threadLike.findMany({
            where: { thread: { tacGiaId: userId } },
            include: {
                nguoiDung: { select: { id: true, taiKhoan: true, email: true } },
                thread: { select: { id: true, noiDung: true } }
            },
            orderBy: { ngayTao: 'desc' },
            take: limit,
        });

        // 3. Replies to my threads
        const replies = await this.prisma.thread.findMany({
            where: { threadCha: { tacGiaId: userId } },
            include: {
                tacGia: { select: { id: true, taiKhoan: true, email: true } },
                threadCha: { select: { id: true, noiDung: true } }
            },
            orderBy: { ngayTao: 'desc' },
            take: limit,
        });

        // Combine and sort
        const activity = [
            ...follows.map(f => ({ type: 'FOLLOW', data: f, date: f.ngayTao })),
            ...likes.map(l => ({ type: 'LIKE', data: l, date: l.ngayTao })),
            ...replies.map(r => ({ type: 'REPLY', data: r, date: r.ngayTao })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);

        return activity;
    }
}
