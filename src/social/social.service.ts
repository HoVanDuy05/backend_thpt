import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../communication/websocket.gateway';

@Injectable()
export class SocialService {
    constructor(
        private prisma: PrismaService,
        private websocketGateway: WebsocketGateway
    ) { }

    // --- THREADS ---

    async createThread(userId: number, data: { noiDung: string; hinhAnh?: string; threadChaId?: number }) {
        const thread = await this.prisma.thread.create({
            data: {
                tacGiaId: userId,
                noiDung: data.noiDung,
                hinhAnh: data.hinhAnh,
                threadChaId: data.threadChaId,
            },
            include: {
                threadCha: {
                    select: { tacGiaId: true }
                }
            }
        });

        // Nếu là phản hồi, thông báo cho tác giả bài viết gốc
        if (data.threadChaId && thread.threadCha?.tacGiaId && thread.threadChaId !== userId) {
            this.websocketGateway.emitToUser(thread.threadCha.tacGiaId, 'activity:new', {
                type: 'REPLY',
                senderId: userId,
                threadId: thread.id,
                parentId: data.threadChaId
            });
        }

        return thread;
    }

    async getFeed(userId: number, limit = 20, cursor?: number) {
        // Lấy danh sách đang theo dõi
        const following = await this.prisma.flowTheoDoi.findMany({
            where: { nguoiTheoDoiId: userId },
            select: { nguoiDuocTheoDoiId: true },
        });

        const followingIds = following.map(f => f.nguoiDuocTheoDoiId);
        followingIds.push(userId); // Bao gồm cả bản thân

        const threads = await this.prisma.thread.findMany({
            where: {
                tacGiaId: { in: followingIds },
                threadChaId: null, // Chỉ lấy bài gốc
            },
            include: {
                tacGia: {
                    select: { id: true, taiKhoan: true, email: true, avatar: true, hoTen: true },
                },
                _count: {
                    select: { likes: true, replies: true, reposts: true },
                },
                likes: {
                    where: { nguoiDungId: userId },
                    select: { nguoiDungId: true }
                }
            },
            orderBy: { ngayTao: 'desc' },
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });

        return threads.map(t => ({
            ...t,
            liked: t.likes.length > 0,
            likes: undefined // Hide the relation data
        }));
    }

    async getThreadDetail(id: number, userId?: number) {
        const thread = await this.prisma.thread.findUnique({
            where: { id },
            include: {
                tacGia: {
                    select: { id: true, taiKhoan: true, email: true, avatar: true, hoTen: true },
                },
                replies: {
                    include: {
                        tacGia: { select: { id: true, taiKhoan: true, email: true, avatar: true, hoTen: true } },
                        _count: { select: { likes: true, replies: true } },
                        likes: userId ? {
                            where: { nguoiDungId: userId },
                            select: { nguoiDungId: true }
                        } : false
                    },
                    orderBy: { ngayTao: 'asc' },
                },
                _count: {
                    select: { likes: true, replies: true, reposts: true },
                },
                likes: userId ? {
                    where: { nguoiDungId: userId },
                    select: { nguoiDungId: true }
                } : false
            },
        });

        if (!thread) return null;

        return {
            ...thread,
            liked: userId ? thread.likes.length > 0 : false,
            likes: undefined,
            replies: thread.replies.map(r => ({
                ...r,
                liked: userId ? r.likes.length > 0 : false,
                likes: undefined
            }))
        };
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
            const like = await this.prisma.threadLike.create({
                data: { threadId, nguoiDungId: userId },
                include: {
                    thread: { select: { tacGiaId: true } }
                }
            });

            // Thông báo cho tác giả bài viết
            if (like.thread.tacGiaId !== userId) {
                this.websocketGateway.emitToUser(like.thread.tacGiaId, 'activity:new', {
                    type: 'LIKE',
                    senderId: userId,
                    threadId
                });
            }

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

            // Thông báo cho người được theo dõi
            this.websocketGateway.emitToUser(followingId, 'activity:new', {
                type: 'FOLLOW',
                senderId: followerId
            });

            return { following: true };
        }
    }
    async getUserThreads(userId: number, requesterId?: number, limit = 20, cursor?: number) {
        const threads = await this.prisma.thread.findMany({
            where: {
                tacGiaId: userId,
                threadChaId: null,
            },
            include: {
                tacGia: {
                    select: { id: true, taiKhoan: true, email: true, avatar: true, hoTen: true },
                },
                _count: {
                    select: { likes: true, replies: true, reposts: true },
                },
                likes: requesterId ? {
                    where: { nguoiDungId: requesterId },
                    select: { nguoiDungId: true }
                } : false
            },
            orderBy: { ngayTao: 'desc' },
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });

        return threads.map(t => ({
            ...t,
            liked: requesterId ? t.likes.length > 0 : false,
            likes: undefined
        }));
    }

    async searchThreads(query: string, userId?: number, limit = 20) {
        const threads = await this.prisma.thread.findMany({
            where: {
                noiDung: { contains: query },
                threadChaId: null,
            },
            include: {
                tacGia: {
                    select: { id: true, taiKhoan: true, email: true, avatar: true, hoTen: true },
                },
                _count: {
                    select: { likes: true, replies: true, reposts: true },
                },
                likes: userId ? {
                    where: { nguoiDungId: userId },
                    select: { nguoiDungId: true }
                } : false
            },
            take: limit,
            orderBy: { ngayTao: 'desc' },
        });

        return threads.map(t => ({
            ...t,
            liked: userId ? t.likes.length > 0 : false,
            likes: undefined
        }));
    }

    async getActivity(userId: number, limit = 20) {
        // Enforce a simple activity feed by combining recent interactions

        // 1. New followers
        const follows = await this.prisma.flowTheoDoi.findMany({
            where: { nguoiDuocTheoDoiId: userId },
            include: { nguoiTheoDoi: { select: { id: true, taiKhoan: true, email: true, avatar: true, hoTen: true } } },
            orderBy: { ngayTao: 'desc' },
            take: limit,
        });

        // 2. Likes on my threads
        const likes = await this.prisma.threadLike.findMany({
            where: { thread: { tacGiaId: userId } },
            include: {
                nguoiDung: { select: { id: true, taiKhoan: true, email: true, avatar: true, hoTen: true } },
                thread: { select: { id: true, noiDung: true } }
            },
            orderBy: { ngayTao: 'desc' },
            take: limit,
        });

        // 3. Replies to my threads
        const replies = await this.prisma.thread.findMany({
            where: { threadCha: { tacGiaId: userId } },
            include: {
                tacGia: { select: { id: true, taiKhoan: true, email: true, avatar: true, hoTen: true } },
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

    async getUserSocialProfile(userId: number, requesterId?: number) {
        const user = await this.prisma.nguoiDung.findUnique({
            where: { id: userId },
            include: {
                hoSoHocSinh: {
                    select: {
                        hoTen: true,
                        soDienThoai: true,
                        gioiTinh: true,
                        ngaySinh: true,
                        diaChiThuongTru: true,
                        lopHoc: { select: { id: true, tenLop: true } }
                    }
                },
                hoSoGiaoVien: {
                    select: {
                        hoTen: true,
                        chuyenMon: true,
                        soDienThoai: true,
                        gioiTinh: true,
                        ngaySinh: true,
                        diaChi: true
                    }
                },
                hoSoXaHoi: true,
                _count: {
                    select: {
                        threads: true,
                        followers: true,
                        following: true
                    }
                }
            }
        });

        if (!user) throw new NotFoundException('Không tìm thấy người dùng');

        let isFollowing = false;
        let friendshipStatus: 'NONE' | 'FRIEND' | 'SENT' | 'RECEIVED' | 'BLOCKED' = 'NONE';

        if (requesterId && requesterId !== userId) {
            // Check follow status
            const follow = await this.prisma.flowTheoDoi.findUnique({
                where: {
                    nguoiTheoDoiId_nguoiDuocTheoDoiId: {
                        nguoiTheoDoiId: requesterId,
                        nguoiDuocTheoDoiId: userId
                    }
                }
            });
            isFollowing = !!follow;

            // Check friendship status
            const friendship = await this.prisma.ketBan.findFirst({
                where: {
                    OR: [
                        { nguoiGuiId: requesterId, nguoiNhanId: userId },
                        { nguoiGuiId: userId, nguoiNhanId: requesterId }
                    ]
                }
            });

            if (friendship) {
                if (friendship.trangThai === 'DA_KET_BAN') friendshipStatus = 'FRIEND';
                else if (friendship.trangThai === 'BI_CHAN') friendshipStatus = 'BLOCKED';
                else if (friendship.nguoiGuiId === requesterId) friendshipStatus = 'SENT';
                else friendshipStatus = 'RECEIVED';
            }
        }

        return {
            ...user,
            // Flatten academic profile fields to top-level for EditProfileModal compatibility
            soDienThoai: (user as any).hoSoHocSinh?.soDienThoai || (user as any).hoSoGiaoVien?.soDienThoai,
            gioiTinh: (user as any).hoSoHocSinh?.gioiTinh || (user as any).hoSoGiaoVien?.gioiTinh,
            ngaySinh: (user as any).hoSoHocSinh?.ngaySinh || (user as any).hoSoGiaoVien?.ngaySinh,
            diaChi: (user as any).hoSoHocSinh?.diaChiThuongTru || (user as any).hoSoGiaoVien?.diaChi,
            isFollowing,
            friendshipStatus
        };
    }

    async getTrending() {
        // Return some mock trending topics for now but from API
        // In a real app, this would query a Hashtag table or analyze thread content
        return [
            { id: 1, name: 'SchoolLife', category: 'Trending in Vietnam', count: '12.5K' },
            { id: 2, name: 'NextJS', category: 'Technology', count: '8.2K' },
            { id: 3, name: 'DeepMind', category: 'AI', count: '15.1K' },
            { id: 4, name: 'Programming', category: 'Education', count: '5.4K' },
        ];
    }

    async getSuggestedUsers(userId: number, limit = 5) {
        // Get users that current user is NOT following
        const following = await this.prisma.flowTheoDoi.findMany({
            where: { nguoiTheoDoiId: userId },
            select: { nguoiDuocTheoDoiId: true },
        });

        const followingIds = following.map(f => f.nguoiDuocTheoDoiId);
        followingIds.push(userId); // Don't suggest self

        return this.prisma.nguoiDung.findMany({
            where: {
                id: { notIn: followingIds }
            },
            select: {
                id: true,
                taiKhoan: true,
                hoTen: true,
                avatar: true,
            },
            take: limit,
        });
    }
}
